# Hướng dẫn Giải thích Luồng Code Đặt lịch Walk-in & Thanh toán (Dành cho Demo)

Tài liệu này giúp bạn hiểu rõ và giải thích trôi chảy cách hệ thống hoạt động từ lúc người dùng thao tác trên giao diện (Frontend - React) đến khi xử lý dữ liệu và lưu trữ (Backend - Spring Boot) cho tính năng đặt lịch khám trực tiếp (Walk-in) và Thanh toán qua PayOS.

---

## 1. Luồng hiển thị lịch động về Slot trống của Bác sĩ

**Câu hỏi thường gặp:** *"Tại sao hệ thống lại hiển thị được các khung giờ trống một cách linh hoạt dựa vào ngày và bác sĩ?"*

**Giải thích luồng chạy:**
1. **Frontend (Giao diện):** 
   - Trên file `WalkInModal.jsx`, hệ thống sử dụng hook `useEffect`. Mỗi khi người dùng thay đổi các trường **Chuyên khoa**, **Bác sĩ**, hoặc **Ngày khám**, hàm `fetchSlots()` sẽ lập tức được gọi.
   - Hàm này sẽ gửi một HTTP GET Request thông qua `appointmentService.getAvailableSlots(...)` truyền các tham số về Backend.

2. **Backend (Controller & Service):**
   - API `GET /api/receptionist/appointments/available-slots` trong `ReceptionistAppointmentController` sẽ tiếp nhận request.
   - Controller gọi xuống `AppointmentServiceImpl.getAvailableSchedules(...)`.

3. **Xử lý Logic Backend:**
   - Hàm này sẽ gọi `ScheduleRepository.findAvailableSchedules(...)` truy vấn vào Database lấy tất cả các khung giờ (Schedule) của bác sĩ đó trong ngày được chọn.
   - Hệ thống tự động kiểm tra xem các khung giờ đó đã có người đặt chưa (bằng cách loại trừ những lịch hẹn đã có trạng thái). Nhờ vậy, API chỉ trả về Frontend một danh sách các `slot` **còn trống thực sự**, tránh việc 2 người đặt trùng 1 khung giờ.

---

## 2. Luồng Đặt lịch Walk-in (Walk-in Booking)

**Câu hỏi thường gặp:** *"Khi bấm xác nhận đặt lịch thì hệ thống lưu dữ liệu và tạo lịch hẹn như thế nào? Bệnh nhân mới thì sao?"*

**Giải thích luồng chạy:**
1. **Frontend (Giao diện):**
   - Lễ tân điền đủ thông tin, chọn slot và bấm **"Tạo lịch hẹn"**. 
   - Hàm `handleSubmit()` trong `WalkInModal.jsx` đóng gói toàn bộ dữ liệu (tên, email, giới tính, thời gian, lý do...) và gọi API `POST /api/receptionist/appointments/walk-in`.

2. **Backend (Tạo hồ sơ bệnh nhân mới):**
   - Trong `AppointmentServiceImpl.createWalkInAppointment`, hệ thống sẽ lấy `email` vừa nhập để tìm kiếm trong Database (`userRepository.findByEmail`).
   - **Đặc biệt:** Nếu bệnh nhân chưa từng có tài khoản (lần đầu đến khám), code sử dụng hàm `.orElseGet()` để tự động `User.builder()` sinh ra một tài khoản mới tinh với Role là `PATIENT`, mật khẩu mặc định là số điện thoại, và lưu thông tin giới tính (`patientGender`) vừa nhập.

3. **Backend (Tạo cuộc hẹn & Khởi tạo Thanh toán):**
   - Hệ thống khóa (lock) Slot bác sĩ đã chọn và khởi tạo đối tượng `Appointment`, gán trạng thái là `PENDING_PAYMENT` (Chờ thanh toán).
   - Ngay sau đó, hàm gọi sang hệ thống thanh toán để khởi tạo đối tượng `Payment`.
   - Kết quả trả về cho Frontend là đối tượng `AppointmentDetailResponse` chứa thông tin lịch khám và cả `appointmentId` để chuẩn bị cho bước thanh toán tiếp theo.

---

## 3. Luồng Thanh toán và Tự động chuyển trạng thái

**Câu hỏi thường gặp:** *"Tại sao mã QR lại hiển thị ra? Làm sao hệ thống biết tôi đã quét mã thanh toán thành công để tự động chuyển trạng thái lịch khám?"*

**Giải thích luồng chạy:**
1. **Frontend (Hiển thị Mã QR):**
   - Khi API Đặt lịch trả về thành công, `AppointmentListPage.jsx` kích hoạt hàm `handleWalkInSuccess`. Hàm này ngay lập tức mở Popup thanh toán (`PaymentModal.jsx`).
   - `PaymentModal` gọi API tạo Link Thanh Toán từ PayOS, Backend lúc này đẩy request lên server của PayOS lấy về chuỗi Base64 của ảnh QR Code và `checkoutUrl`. Frontend sẽ dùng thẻ `<img>` render mã QR ra màn hình.

2. **Cơ chế Polling (Hỏi vòng liên tục):**
   - Ngay khi QR hiện lên, hàm `useEffect` trong `PaymentModal.jsx` thiết lập một vòng lặp `setInterval`. Cứ mỗi **3 giây**, Frontend tự động gọi API `GET /api/payments/status/{appointmentId}` để hỏi Backend: *"Khách đã chuyển khoản chưa?"*.

3. **Backend (Kiểm tra trạng thái & Cập nhật):**
   - API này gọi vào `PaymentServiceImpl.checkPaymentStatus`. Code sẽ lấy `orderCode` của giao dịch và gửi request lên PayOS (`payOS.paymentRequests().get()`).
   - Nếu khách hàng đã dùng app ngân hàng quét mã và chuyển tiền xong, PayOS sẽ đổi trạng thái thành `"PAID"`. 
   - Khi Backend đọc được chữ `"PAID"`, điều kỳ diệu sẽ xảy ra:
     - Đổi `PaymentStatus` từ `PENDING` thành `COMPLETED`.
     - **Sinh Mã giao dịch:** Chạy hàm `generateTransactionCode()` sinh ra chuỗi 6 ký tự chữ và số ngẫu nhiên (vd: `X9K2A1`) lưu vào Database.
     - **Chuyển trạng thái lịch hẹn:** Tìm lại `Appointment` tương ứng và đổi trạng thái từ `PENDING_PAYMENT` sang `WAITING_FOR_TURN` (vì đây là lịch Walk-in, đặt là khám ngay).

4. **Kích hoạt Thông báo & Email (Event Trigger):**
   - Cũng ngay tại lúc này, Backend gọi 2 service phụ: `notificationService.createPaymentSuccessNotification` (Bắn thông báo chuông trên web) và `emailService.sendPaymentSuccessEmail` (Gửi email hóa đơn cho khách hàng).

5. **Frontend (Báo Thành Công):**
   - Ở chu kỳ 3 giây tiếp theo, Frontend nhận được chữ `"WAITING_FOR_TURN"` thay vì `"PENDING"`. Vòng lặp `setInterval` bị hủy (`clearInterval`). Màn hình hiển thị "Thanh toán thành công" màu xanh lá và tự động làm mới danh sách lịch hẹn!

---

### Mẹo khi thuyết trình:
- Hãy thao tác trực tiếp trên màn hình: Mở form, chọn ngày. Vừa chọn ngày vừa nói: *"Chỗ này hệ thống đang gọi API getAvailableSlots, thầy/cô có thể thấy nó chỉ hiện những giờ trống..."*.
- Khi popup QR hiện lên, hãy giải thích cơ chế "Polling 3 giây" - *"Trang web của em đang tự động hỏi Backend xem tiền đã vào tài khoản PayOS chưa..."*
- Khi thanh toán xong, mở phần chi tiết lên và chỉ vào cái "Mã giao dịch" 6 ký tự và trạng thái đã tự động đổi để chứng minh dữ liệu đồng bộ tức thời.
