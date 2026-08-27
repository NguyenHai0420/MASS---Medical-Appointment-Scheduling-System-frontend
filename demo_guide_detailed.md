# Hướng Dẫn Giải Thích Chi Tiết Luồng Code MASS (Dành Cho Buổi Bảo Vệ Đồ Án)

Tài liệu này được thiết kế để bạn có thể vừa thao tác trên màn hình, vừa tự tin giải thích từng dòng code, từng component và logic chạy ngầm bên dưới hệ thống cho giáo viên nghe.

---

## 1. Cơ Chế Hiển Thị Lịch Động Về Slot Trống

**Thao tác trên màn hình:** Bạn mở chức năng "Tạo lịch hẹn Walk-in", chọn "Bác sĩ" và "Ngày khám".

**Giáo viên hỏi:** *"Làm sao hệ thống biết được bác sĩ đó còn trống khung giờ nào để hiển thị lên cho em chọn?"*

**Cách giải thích:**
- **Về mặt Frontend:** Khi em chọn Bác sĩ và Ngày khám, trong component `WalkInModal.jsx` có sử dụng một hook là `useEffect`. Hook này lắng nghe sự thay đổi của biến `doctorId` và `date`. Khi hai biến này có giá trị, nó sẽ kích hoạt hàm `fetchSlots()`, gọi API `GET /api/receptionist/appointments/available-schedules` thông qua thư viện Axios.
- **Về mặt Backend:** 
  - Tại Controller (`ReceptionistAppointmentController`), request được tiếp nhận và đẩy xuống Service (`AppointmentServiceImpl`).
  - Tại Service, em gọi một câu query Custom trong `ScheduleRepository` tên là `findAvailableSchedules`. 
  - **Logic cốt lõi:** Câu query này lấy ra toàn bộ các khung giờ (Schedules) của bác sĩ đó trong ngày. **Nhưng**, nó sử dụng toán tử `NOT EXISTS` hoặc `LEFT JOIN` để loại bỏ những khung giờ (Schedule ID) đã được gắn vào một `Appointment` (Cuộc hẹn) đang có hiệu lực. Nhờ vậy, API chỉ trả về Frontend những khung giờ còn trống hoàn toàn.

---

## 2. Luồng Xử Lý Khi Bấm "Tạo Lịch Hẹn Walk-in"

**Thao tác trên màn hình:** Bạn điền thông tin bệnh nhân (hoặc chọn bệnh nhân cũ), chọn slot giờ, và bấm nút "Tạo lịch hẹn".

**Giáo viên hỏi:** *"Code chạy từ đâu đến đâu khi em bấm nút này? Bệnh nhân mới thì xử lý thế nào?"*

**Cách giải thích:**
- **Tại Frontend (`WalkInModal.jsx`):** 
  - Khi bấm Submit, hàm `handleSubmit()` sẽ gom toàn bộ dữ liệu trên form thành một Object `payload` (chứa tên, email, SDT, ngày, khung giờ...) và gọi API `POST /api/receptionist/appointments/walk-in`.
- **Tại Backend (`AppointmentServiceImpl.java - hàm createWalkInAppointment`):**
  - **Bước 1 (Kiểm tra Bệnh nhân):** Code sẽ lấy `email` truyền lên để tìm trong bảng `User`. Em sử dụng cú pháp `.orElseGet()` của Java Optional. Nếu tìm thấy email, lấy user đó. Nếu không tìm thấy (Bệnh nhân mới), hệ thống tự động khởi tạo đối tượng `User` mới, set Role là `ROLE_PATIENT`, và gán mật khẩu mặc định là số điện thoại để họ có thể đăng nhập sau này.
  - **Bước 2 (Tạo Cuộc Hẹn):** Sinh ra đối tượng `Appointment`, gán `Patient` và `Schedule` tương ứng, và set trạng thái khởi tạo là `PENDING_PAYMENT` (Chờ thanh toán).
  - **Bước 3 (Khởi tạo Thanh toán PayOS):** Backend gọi sang dịch vụ PayOS để xin cấp 1 mã thanh toán (`orderCode`) và link mã QR. Lưu thông tin này vào bảng `Payment`.
  - Cuối cùng, trả dữ liệu về cho Frontend.

---

## 3. Luồng Thanh Toán: Khác biệt giữa Polling (useEffect) và Webhook

Ngay khi API tạo lịch thành công, Frontend đóng form Walk-in và mở tự động Popup Thanh toán (`PaymentModal.jsx`). Mã QR hiện ra.

**Giáo viên hỏi:** *"Thanh toán hoạt động thế nào? Khi khách quét mã chuyển khoản xong thì làm sao hệ thống em tự chuyển trạng thái được? Em dùng Webhook hay Polling?"*

**Cách giải thích:**
*"Thưa thầy/cô, hệ thống của em thiết kế tích hợp cả **hai cơ chế**: Polling (hỏi vòng ở Frontend) và Webhook (bắt sự kiện ở Backend) để đảm bảo độ tin cậy tuyệt đối."*

### Cơ chế 1: Polling (Dùng `useEffect` trên React)
- **Hoạt động:** Trong `PaymentModal.jsx`, em sử dụng `useEffect` chứa hàm `setInterval`. Cứ mỗi **3 giây**, Frontend tự động bắn một API `GET` xuống Backend để hỏi: *"Trạng thái giao dịch của Appointment này đã hoàn thành chưa?"*.
- **Backend xử lý:** Backend dùng `orderCode` để gọi lên hệ thống của cổng thanh toán PayOS kiểm tra trạng thái thực tế.
- **Kết quả:** Nếu khách chuyển khoản thành công, PayOS trả về trạng thái "PAID". Lúc này, Backend cập nhật DB thành `COMPLETED` và Frontend sẽ đổi giao diện thành "Thanh toán thành công" rồi tự động làm mới danh sách.
- **Ưu điểm:** Cập nhật giao diện (UI) cho người dùng ngay lập tức (Real-time cảm giác) mà không cần họ tải lại trang. 

### Cơ chế 2: Webhook (Bắt sự kiện từ Server-to-Server)
- **Hoạt động:** Thay vì Frontend phải hỏi, bên PayOS cung cấp tính năng Webhook. Ngay khoảnh khắc ngân hàng trừ tiền khách, máy chủ của PayOS chủ động bắn một API (HTTP POST) thẳng vào Server Backend của em tại địa chỉ `POST /api/payments/webhook`.
- **Backend xử lý (`PaymentController.handlePayosWebhook`):** Backend tiếp nhận, xác thực chữ ký bảo mật (Signature) để chống giả mạo. Sau đó tự động tìm `orderCode` trong Database và cập nhật trạng thái lịch hẹn.
- **Sự khác biệt & Tại sao phải dùng Webhook:** 
  - *Polling* phụ thuộc vào việc người dùng phải mở trình duyệt. Nếu người dùng tắt trang web đi trước khi chuyển khoản xong, Frontend sẽ ngừng gọi Polling -> DB sẽ không được cập nhật.
  - *Webhook* là giao tiếp giữa 2 máy chủ (Server to Server). Dù người dùng tắt web, mất mạng hay tắt máy tính, máy chủ PayOS vẫn báo thành công về máy chủ của em, giúp Database không bao giờ bị sai lệch dữ liệu.

---

## 4. Tự Động Chuyển Trạng Thái Sau Khi Thanh Toán

**Cách giải thích quá trình đổi trạng thái:**
*"Khi thanh toán thành công (dù thông qua Polling phát hiện ra hay Webhook báo về), Backend của em sẽ chạy chung một luồng xử lý cuối cùng trong `PaymentServiceImpl`: "*
1. Đổi trạng thái bảng `Payment` từ `PENDING` -> `COMPLETED`.
2. Lấy đối tượng `Appointment` tương ứng ra. Nếu đây là lịch hẹn khám trực tiếp (Walk-in), hệ thống tự động đổi từ `PENDING_PAYMENT` sang `WAITING_FOR_TURN` (Chờ đến lượt).
3. **Sinh Mã Giao Dịch:** Code sẽ sinh ra một chuỗi 6 ký tự ngẫu nhiên (ví dụ `AX29K1`) lưu vào trường `transactionCode` để in ra biên lai đối chiếu.
4. **Trigger (Kích hoạt) sự kiện phụ:** Backend gọi hàm `notificationService.createNotification()` để báo chuông đỏ trên web, và `emailService.sendEmail()` để gửi hóa đơn về email cho khách hàng. Mọi thứ được gói gọn trong 1 Transaction để đảm bảo tính toàn vẹn dữ liệu.
