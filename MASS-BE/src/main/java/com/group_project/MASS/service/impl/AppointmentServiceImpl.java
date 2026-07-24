package com.group_project.MASS.service.impl;

import com.group_project.MASS.dto.AppointmentDto;
import com.group_project.MASS.dto.request.AppointmentRequestDto;
import com.group_project.MASS.dto.request.RescheduleRequestDto;
import com.group_project.MASS.service.AppointmentService;

import com.group_project.MASS.dto.response.AppointmentResponse;
import com.group_project.MASS.dto.request.CancelAppointmentRequest;
import com.group_project.MASS.dto.request.CreateWalkInAppointmentRequest;
import com.group_project.MASS.dto.request.UpdateAppointmentRequest;
import com.group_project.MASS.dto.request.UpdateAppointmentStatusRequest;
import com.group_project.MASS.dto.response.*;
import com.group_project.MASS.mapper.AppointmentMapper;
import com.group_project.MASS.model.*;
import com.group_project.MASS.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.cglib.core.Local;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.time.Duration;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class AppointmentServiceImpl implements AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final ScheduleRepository scheduleRepository;
    private final PaymentRepository paymentRepository;
    private final DoctorProfileRepository doctorProfileRepository;
    private final SpecialtyRepository specialtyRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    private AppointmentResponse toResponse(Appointment a) {
        return AppointmentResponse.builder()
                .id(a.getId())
                .patientName(a.getPatient().getFullName())
                .patientEmail(a.getPatient().getEmail())
                .reason(a.getReason())
                .status(a.getStatus().name())
                .scheduleDate(a.getSchedule().getDate())
                .scheduleStartTime(a.getSchedule().getStartTime())
                .scheduleEndTime(a.getSchedule().getEndTime())
                .createdAt(a.getCreatedAt())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<AppointmentResponse> getMyAppointments(String email) {
        DoctorProfile dp = doctorProfileRepository.findByUserEmail(email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy DoctorProfile cho email: " + email));
        return appointmentRepository.findByDoctorProfileOrderByCreatedAtDesc(dp)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<AppointmentListResponse> getAppointments(LocalDate date,
                                                                 Long specialtyId,
                                                                 AppointmentStatus status,
                                                                 int page,
                                                                 int size) {

        if (page < 0) {
            throw new IllegalArgumentException("Page không được nhỏ hơn 0");
        }

        if (size < 1 || size > 100) {
            throw new IllegalArgumentException("Size phải nằm trong khoảng từ 1 đến 100");
        }

        Pageable pageable = PageRequest.of(
                page,
                size,
                Sort.by(
                        Sort.Order.asc("schedule.date"),
                        Sort.Order.asc("schedule.startTime")
                )
        );

        Page<Appointment> appointmentPage;

        if (date != null && specialtyId != null && status != null) {
            appointmentPage = appointmentRepository
                    .findByDoctorProfileSpecialtyIdAndScheduleDateAndStatus(
                            specialtyId,
                            date,
                            status,
                            pageable
                    );

        } else if (date != null && specialtyId != null) {
            appointmentPage = appointmentRepository
                    .findByDoctorProfileSpecialtyIdAndScheduleDate(
                            specialtyId,
                            date,
                            pageable
                    );

        } else if (date != null && status != null) {
            appointmentPage = appointmentRepository
                    .findByScheduleDateAndStatus(
                            date,
                            status,
                            pageable
                    );

        } else if (specialtyId != null && status != null) {
            appointmentPage = appointmentRepository
                    .findByDoctorProfileSpecialtyIdAndStatus(
                            specialtyId,
                            status,
                            pageable
                    );

        } else if (date != null) {
            appointmentPage = appointmentRepository
                    .findByScheduleDate(
                            date,
                            pageable
                    );

        } else if (specialtyId != null) {
            appointmentPage = appointmentRepository
                    .findByDoctorProfileSpecialtyId(
                            specialtyId,
                            pageable
                    );

        } else if (status != null) {
            appointmentPage = appointmentRepository
                    .findByStatus(
                            status,
                            pageable
                    );

        } else {
            appointmentPage = appointmentRepository
                    .findAll(pageable);
        }

        List<AppointmentListResponse> content =
                appointmentPage.getContent()
                        .stream()
                        .map(this::mapToListResponse)
                        .toList();

        return PageResponse.<AppointmentListResponse>builder()
                .content(content)
                .page(appointmentPage.getNumber())
                .size(appointmentPage.getSize())
                .totalElements(appointmentPage.getTotalElements())
                .totalPages(appointmentPage.getTotalPages())
                .first(appointmentPage.isFirst())
                .last(appointmentPage.isLast())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public AppointmentDetailResponse getAppointmentDetail(Long appointmentId) {

        if (appointmentId == null) {
            throw new RuntimeException("ID của lịch hẹn không được để trống");
        }

        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy cuộc hẹn với ID: " + appointmentId));

        Payment payment = paymentRepository
                .findByAppointmentId(appointmentId)
                .orElse(null);

        return AppointmentMapper.toDetailResponse(
                appointment,
                payment
        );
    }

    @Override
    public AppointmentDetailResponse createWalkInAppointment(
            CreateWalkInAppointmentRequest request
    ) {
        if (request == null) {
            throw new IllegalArgumentException(
                    "Dữ liệu tạo lịch không được để trống"
            );
        }

        validateWalkInRequest(request);

        User patient = userRepository.findByEmail(request.getPatientEmail())
                .orElseGet(() -> {
                    User newUser = User.builder()
                            .email(request.getPatientEmail())
                            .fullName(request.getPatientName())
                            .phone(request.getPatientPhone())
                            .password(passwordEncoder.encode(request.getPatientPhone()))
                            .dateOfBirth(request.getDateOfBirth())
                            .address(request.getAddress())
                            .gender(request.getPatientGender())
                            .role(Role.ROLE_PATIENT)
                            .build();
                    return userRepository.save(newUser);
                });

        if (patient.getRole() != Role.ROLE_PATIENT) {
            throw new IllegalArgumentException(
                    "Email này đã được đăng ký cho tài khoản không phải bệnh nhân"
            );
        }

        Specialty specialty = specialtyRepository
                .findById(request.getSpecialtyId())
                .orElseThrow(() -> new IllegalArgumentException(
                        "Không tìm thấy chuyên khoa có ID: "
                                + request.getSpecialtyId()
                ));

        LocalTime searchFromTime = determineSearchFromTime(
                request.getAppointmentDate(),
                request.getSearchFromTime()
        );

        Schedule selectedSchedule;

        if (request.getDoctorProfileId() != null) {
            DoctorProfile doctorProfile = doctorProfileRepository
                            .findById(request.getDoctorProfileId())
                            .orElseThrow(() -> new IllegalArgumentException(
                                    "Không tìm thấy bác sĩ có ID: " + request.getDoctorProfileId()
                            ));

            if (!doctorProfile.getSpecialty()
                    .getId()
                    .equals(specialty.getId())) {
                throw new IllegalArgumentException(
                        "Bác sĩ được chọn không thuộc chuyên khoa "
                                + specialty.getName()
                );
            }

            selectedSchedule = findNearestAvailableScheduleByDoctor(
                    doctorProfile.getId(),
                    request.getAppointmentDate(),
                    searchFromTime
            );

        } else {
            selectedSchedule = findNearestAvailableScheduleBySpecialty(
                    specialty.getId(),
                    request.getAppointmentDate(),
                    searchFromTime
            );
        }

        boolean occupied = appointmentRepository
                .existsByScheduleIdAndStatusNot(
                        selectedSchedule.getId(),
                        AppointmentStatus.CANCELLED
                );

        if (occupied || !selectedSchedule.isAvailable()) {
            throw new IllegalStateException(
                    "Slot vừa được người khác sử dụng. "
                            + "Vui lòng chọn lại slot khác"
            );
        }

        int queueNumber = calculateQueueNumber(
                selectedSchedule.getStartTime()
        );

        Appointment appointment = Appointment.builder()
                .patient(patient)
                .doctorProfile(selectedSchedule.getDoctorProfile())
                .schedule(selectedSchedule)

                .status(AppointmentStatus.PENDING_PAYMENT)
                .reason(request.getReason().trim())
                .queueNumber(queueNumber)
                .type(AppointmentType.WALK_IN)
                .build();

        selectedSchedule.setAvailable(false);
        scheduleRepository.save(selectedSchedule);

        Appointment savedAppointment =
                appointmentRepository.save(appointment);

        return AppointmentMapper.toDetailResponse(
                savedAppointment,
                null
        );
    }

    @Override
    public AppointmentDetailResponse updateAppointment(
            Long appointmentId,
            UpdateAppointmentRequest request
    ) {
        if (request == null) {
            throw new IllegalArgumentException(
                    "Dữ liệu cập nhật không được để trống"
            );
        }

        Appointment appointment = appointmentRepository
                .findById(appointmentId).orElseThrow(() ->  new IllegalArgumentException("Không tìm thấy lịch khám với ID: " + appointmentId));

        validateAppointmentCanBeModified(appointment);

        boolean hasScheduleChange = request.getScheduleId() != null
                && !request.getScheduleId()
                .equals(appointment.getSchedule().getId());

        boolean hasReasonChange = request.getReason() != null;

        if (!hasScheduleChange && !hasReasonChange) {
            throw new IllegalArgumentException(
                    "Không có thông tin nào được thay đổi"
            );
        }

        if (hasScheduleChange) {
            changeAppointmentSchedule(
                    appointment,
                    request.getScheduleId()
            );
        }

        if (hasReasonChange) {
            String newReason = request.getReason().trim();

            if (newReason.isBlank()) {
                throw new IllegalArgumentException(
                        "Lý do khám không được để trống"
                );
            }

            appointment.setReason(newReason);
        }

        Appointment savedAppointment =
                appointmentRepository.save(appointment);

        Payment payment = paymentRepository
                .findByAppointmentId(savedAppointment.getId())
                .orElse(null);

        return AppointmentMapper.toDetailResponse(
                savedAppointment,
                payment
        );
    }

    @Override
    public ApiMessageResponse updateAppointmentStatus(
            Long appointmentId,
            UpdateAppointmentStatusRequest request
    ) {
        if (request == null || request.getAppointmentStatus() == null) {
            throw new IllegalArgumentException(
                    "Trạng thái appointment không được để trống"
            );
        }

        Appointment appointment = appointmentRepository
                .findById(appointmentId).orElseThrow(() ->  new IllegalArgumentException("Không tìm thấy lịch khám với ID: " + appointmentId));

        AppointmentStatus currentStatus =
                appointment.getStatus();

        AppointmentStatus newStatus =
                request.getAppointmentStatus();

        if (currentStatus == newStatus) {
            return new ApiMessageResponse(
                    "Appointment đã ở trạng thái " + newStatus
            );
        }

        if (currentStatus == AppointmentStatus.PENDING_PAYMENT) {
            throw new IllegalStateException(
                    "Appointment đang chờ thanh toán. "
                            + "Trạng thái sẽ được cập nhật bởi hệ thống thanh toán"
            );
        }

        if (newStatus == AppointmentStatus.WAITING_FOR_TURN) {
            throw new IllegalArgumentException(
                    "Vui lòng sử dụng chức năng check-in"
            );
        }

        if (newStatus == AppointmentStatus.CANCELLED) {
            throw new IllegalArgumentException(
                    "Vui lòng sử dụng chức năng hủy lịch "
                            + "để chuyển sang trạng thái CANCELLED"
            );
        }

        validateStatusTransition(
                currentStatus,
                newStatus
        );

        appointment.setStatus(newStatus);

        appointmentRepository.save(appointment);

        return new ApiMessageResponse(
                "Cập nhật trạng thái appointment thành công: "
                        + newStatus
        );
    }

    @Override
    public AppointmentDetailResponse checkInAppointment(
            Long appointmentId
    ) {
        Appointment appointment = appointmentRepository
                .findById(appointmentId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Không tìm thấy lịch khám với ID: "
                                + appointmentId
                ));

        if (appointment.getStatus()
                == AppointmentStatus.WAITING_FOR_TURN) {
            throw new IllegalStateException(
                    "Bệnh nhân đã được check-in trước đó"
            );
        }

        if (appointment.getStatus()
                != AppointmentStatus.WAITING_CHECK_IN) {
            throw new IllegalStateException(
                    "Chỉ appointment ở trạng thái WAITING_CHECK_IN "
                            + "mới được check-in"
            );
        }

        Schedule schedule = appointment.getSchedule();

        if (!schedule.getDate().isEqual(LocalDate.now())) {
            throw new IllegalStateException(
                    "Chỉ có thể check-in trong ngày khám"
            );
        }

        LocalTime earliestCheckIn =
                schedule.getStartTime().minusMinutes(60);

        if (LocalTime.now().isBefore(earliestCheckIn)) {
            throw new IllegalStateException(
                    "Chưa đến thời gian check-in. "
                            + "Bệnh nhân chỉ được check-in trước tối đa 60 phút"
            );
        }

        Payment payment = paymentRepository
                .findByAppointmentId(appointmentId)
                .orElseThrow(() -> new IllegalStateException(
                        "Appointment chưa có thông tin thanh toán"
                ));

        if (payment.getPaymentStatus()
                != PaymentStatus.COMPLETED) {
            throw new IllegalStateException(
                    "Appointment chưa thanh toán thành công"
            );
        }

        appointment.setStatus(
                AppointmentStatus.WAITING_FOR_TURN
        );

        appointment.setCheckedInAt(
                LocalDateTime.now()
        );

        Appointment savedAppointment =
                appointmentRepository.save(appointment);

        return AppointmentMapper.toDetailResponse(
                savedAppointment,
                payment
        );
    }

    @Override
    public ApiMessageResponse cancelAppointment(
            Long appointmentId,
            CancelAppointmentRequest request
    ) {
        if (request == null
                || request.getCancelReason() == null
                || request.getCancelReason().isBlank()) {
            throw new IllegalArgumentException(
                    "Lý do hủy lịch không được để trống"
            );
        }

        Appointment appointment = appointmentRepository
                .findById(appointmentId).orElseThrow(() ->  new IllegalArgumentException("Không tìm thấy lịch khám với ID: " + appointmentId));

        if (appointment.getStatus()
                == AppointmentStatus.CANCELLED) {
            throw new IllegalStateException(
                    "Appointment đã được hủy trước đó"
            );
        }

        if (appointment.getStatus()
                == AppointmentStatus.COMPLETED) {
            throw new IllegalStateException(
                    "Không thể hủy lịch đã hoàn thành"
            );
        }

        if (appointment.getStatus()
                == AppointmentStatus.NO_SHOW) {
            throw new IllegalStateException(
                    "Không thể hủy lịch đã được đánh dấu không đến"
            );
        }

        if (appointment.getStatus() != AppointmentStatus.PENDING_PAYMENT) {
            throw new IllegalStateException(
                    "Không thể hủy lịch khám đã thanh toán"
            );
        }

        Schedule schedule = appointment.getSchedule();

        if (isScheduleInFuture(schedule)) {
            schedule.setAvailable(true);
            scheduleRepository.save(schedule);
        }

        appointment.setStatus(
                AppointmentStatus.CANCELLED
        );

        appointmentRepository.save(appointment);

        return new ApiMessageResponse(
                "Hủy lịch khám thành công. Lý do: "
                        + request.getCancelReason().trim()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public List<AvailableScheduleResponse> getAvailableSchedules(
            Long specialtyId,
            Long doctorProfileId,
            LocalDate date,
            LocalTime fromTime
    ) {
        if (date == null) {
            throw new IllegalStateException("Ngày khám không được để trống");
        }

        if (date.isBefore(LocalDate.now())) {
            throw new IllegalStateException("Ngày khám không được nhỏ hơn ngày hiện tại");
        }

        if (specialtyId == null && doctorProfileId == null) {
            throw new IllegalStateException("Phải chọn chuyên khoa hoặc bác sĩ");
        }

        if (doctorProfileId != null) {
            DoctorProfile doctorProfile = doctorProfileRepository
                    .findById(doctorProfileId).orElseThrow(() -> new IllegalArgumentException("Không tìm thấy bác sĩ có ID: " + doctorProfileId));
            if (specialtyId != null && !doctorProfile.getSpecialty().getId().equals(specialtyId)) {
                throw new IllegalArgumentException("Bác sĩ không thuộc chuyên khoa đã chọn");
            }
        } else {
            specialtyRepository.findById(specialtyId)
                    .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy chuyên khoa có ID: " + specialtyId));
        }

        LocalTime selectedFromTime = determineSearchFromTime(date, fromTime);
        List<LocalTime> allDailySlots = generateDailySlots();

        List<AvailableScheduleResponse> responses = new ArrayList<>();
        long fakeIdCounter = -1L;

        List<DoctorProfile> availableDoctors;
        if (doctorProfileId != null) {
            availableDoctors = List.of(doctorProfileRepository.findById(doctorProfileId).get());
        } else {
            availableDoctors = doctorProfileRepository.findBySpecialtyId(specialtyId);
        }

        for (LocalTime slotTime : allDailySlots) {
            if (slotTime.isBefore(selectedFromTime)) continue;

            List<DoctorProfile> freeDoctors = new ArrayList<>();
            for (DoctorProfile doc : availableDoctors) {
                boolean isBooked = appointmentRepository.existsByDoctorProfileIdAndScheduleDateAndScheduleStartTimeAndStatusNot(
                        doc.getId(), date, slotTime, AppointmentStatus.CANCELLED);
                if (!isBooked) {
                    freeDoctors.add(doc);
                }
            }

            if (!freeDoctors.isEmpty()) {
                DoctorProfile assignedDoc = freeDoctors.get(0);
                AvailableScheduleResponse response = AvailableScheduleResponse.builder()
                        .scheduleId(fakeIdCounter--)
                        .startTime(slotTime)
                        .endTime(slotTime.plusMinutes(30))
                        .queueNumber(calculateQueueNumber(slotTime))
                        .doctorName(doctorProfileId != null ? assignedDoc.getUser().getFullName() : null)
                        .build();
                responses.add(response);
            }
        }

        return responses;
    }

    private List<LocalTime> generateDailySlots() {
        List<LocalTime> slots = new ArrayList<>();
        LocalTime time = LocalTime.of(7, 0);
        while (time.isBefore(LocalTime.of(11, 30))) {
            slots.add(time);
            time = time.plusMinutes(30);
        }
        time = LocalTime.of(13, 30);
        while (time.isBefore(LocalTime.of(17, 0))) {
            slots.add(time);
            time = time.plusMinutes(30);
        }
        return slots;
    }

    private AppointmentListResponse mapToListResponse(Appointment appointment) {
        Payment payment = paymentRepository
                .findByAppointmentId(appointment.getId())
                .orElse(null);

        return AppointmentMapper.toListResponse(
                appointment,
                payment
        );
    }

    private void validateWalkInRequest(
            CreateWalkInAppointmentRequest request
    ) {
        if (request.getPatientEmail() == null || request.getPatientEmail().trim().isEmpty()) {
            throw new IllegalArgumentException(
                    "Email bệnh nhân không được để trống"
            );
        }

        if (request.getSpecialtyId() == null) {
            throw new IllegalArgumentException(
                    "Chuyên khoa không được để trống"
            );
        }

        if (request.getAppointmentDate() == null) {
            throw new IllegalArgumentException(
                    "Ngày khám không được để trống"
            );
        }

        if (request.getAppointmentDate()
                .isBefore(LocalDate.now())) {
            throw new IllegalArgumentException(
                    "Ngày khám không được nhỏ hơn ngày hiện tại"
            );
        }

        if (request.getReason() == null
                || request.getReason().isBlank()) {
            throw new IllegalArgumentException(
                    "Lý do khám không được để trống"
            );
        }
    }

    private Schedule findNearestAvailableScheduleByDoctor(
            Long doctorProfileId,
            LocalDate date,
            LocalTime fromTime
    ) {
        DoctorProfile doc = doctorProfileRepository.findById(doctorProfileId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy bác sĩ"));

        List<LocalTime> allSlots = generateDailySlots();
        for (LocalTime slotTime : allSlots) {
            if (slotTime.isBefore(fromTime)) continue;

            boolean isBooked = appointmentRepository.existsByDoctorProfileIdAndScheduleDateAndScheduleStartTimeAndStatusNot(
                    doc.getId(), date, slotTime, AppointmentStatus.CANCELLED);

            if (!isBooked) {
                return getOrCreateSchedule(doc, date, slotTime);
            }
        }

        throw new IllegalStateException("Bác sĩ không còn slot trống phù hợp trong ngày " + date);
    }

    private Schedule findNearestAvailableScheduleBySpecialty(
            Long specialtyId,
            LocalDate date,
            LocalTime fromTime
    ) {
        List<DoctorProfile> availableDoctors = doctorProfileRepository.findBySpecialtyId(specialtyId);
        if (availableDoctors.isEmpty()) {
             throw new IllegalStateException("Không có bác sĩ nào thuộc chuyên khoa này");
        }

        List<LocalTime> allSlots = generateDailySlots();
        for (LocalTime slotTime : allSlots) {
            if (slotTime.isBefore(fromTime)) continue;

            for (DoctorProfile doc : availableDoctors) {
                boolean isBooked = appointmentRepository.existsByDoctorProfileIdAndScheduleDateAndScheduleStartTimeAndStatusNot(
                        doc.getId(), date, slotTime, AppointmentStatus.CANCELLED);

                if (!isBooked) {
                    return getOrCreateSchedule(doc, date, slotTime);
                }
            }
        }

        throw new IllegalStateException("Không còn slot trống của chuyên khoa trong ngày " + date);
    }

    private Schedule getOrCreateSchedule(DoctorProfile doc, LocalDate date, LocalTime slotTime) {
        return scheduleRepository.findByDoctorProfileIdAndDateAndStartTime(doc.getId(), date, slotTime)
                .orElseGet(() -> scheduleRepository.save(Schedule.builder()
                        .doctorProfile(doc)
                        .date(date)
                        .startTime(slotTime)
                        .endTime(slotTime.plusMinutes(30))
                        .isAvailable(true)
                        .build()));
    }

    private LocalTime determineSearchFromTime(
            LocalDate appointmentDate,
            LocalTime requestedTime
    ) {
        LocalTime clinicOpeningTime = LocalTime.of(7, 0);

        if (appointmentDate.isAfter(LocalDate.now())) {
            if (requestedTime == null) {
                return clinicOpeningTime;
            }

            return requestedTime.isBefore(clinicOpeningTime)
                    ? clinicOpeningTime
                    : requestedTime;
        }

        LocalTime currentTime = LocalTime.now();

        LocalTime result = requestedTime != null
                ? requestedTime
                : currentTime;

        if (result.isBefore(currentTime)) {
            result = currentTime;
        }

        if (result.isBefore(clinicOpeningTime)) {
            result = clinicOpeningTime;
        }

        return result;
    }

    private int calculateQueueNumber(
            LocalTime slotStartTime
    ) {
        LocalTime clinicOpeningTime = LocalTime.of(7, 0);
        int slotDurationMinutes = 30;

        if (slotStartTime == null) {
            throw new IllegalArgumentException(
                    "Thời gian bắt đầu của slot không được để trống"
            );
        }

        if (slotStartTime.isBefore(clinicOpeningTime)) {
            throw new IllegalArgumentException(
                    "Slot khám không được bắt đầu trước 07:00"
            );
        }

        long minutesFromOpening = Duration.between(
                clinicOpeningTime,
                slotStartTime
        ).toMinutes();

        if (minutesFromOpening % slotDurationMinutes != 0) {
            throw new IllegalArgumentException(
                    "Thời gian bắt đầu của schedule phải theo slot 30 phút"
            );
        }

        return (int) (minutesFromOpening / slotDurationMinutes) + 1;
    }

    private void changeAppointmentSchedule(
            Appointment appointment,
            Long newScheduleId
    ) {
        Schedule oldSchedule = appointment.getSchedule();

        Schedule newSchedule = scheduleRepository
                .findById(newScheduleId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Không tìm thấy schedule có ID: "
                                + newScheduleId
                ));

        validateNewSchedule(
                appointment,
                newSchedule
        );

        oldSchedule.setAvailable(true);

        newSchedule.setAvailable(false);

        scheduleRepository.save(oldSchedule);
        scheduleRepository.save(newSchedule);

        appointment.setSchedule(newSchedule);
        appointment.setDoctorProfile(
                newSchedule.getDoctorProfile()
        );

        appointment.setQueueNumber(
                calculateQueueNumber(
                        newSchedule.getStartTime()
                )
        );
    }

    private void validateNewSchedule(
            Appointment appointment,
            Schedule newSchedule
    ) {
        if (!newSchedule.isAvailable()) {
            throw new IllegalStateException(
                    "Slot được chọn hiện không còn trống"
            );
        }

        boolean occupied = appointmentRepository
                .existsByScheduleIdAndStatusNot(
                        newSchedule.getId(),
                        AppointmentStatus.CANCELLED
                );

        if (occupied) {
            throw new IllegalStateException(
                    "Slot được chọn đã có lịch khám"
            );
        }

        if (newSchedule.getDate().isBefore(LocalDate.now())) {
            throw new IllegalArgumentException(
                    "Không thể chuyển lịch sang ngày trong quá khứ"
            );
        }

        if (newSchedule.getDate().isEqual(LocalDate.now())
                && newSchedule.getStartTime()
                .isBefore(LocalTime.now())) {
            throw new IllegalArgumentException(
                    "Không thể chuyển lịch sang giờ đã qua"
            );
        }

        Long oldSpecialtyId = appointment
                .getDoctorProfile()
                .getSpecialty()
                .getId();

        Long newSpecialtyId = newSchedule
                .getDoctorProfile()
                .getSpecialty()
                .getId();

        if (!oldSpecialtyId.equals(newSpecialtyId)) {
            throw new IllegalArgumentException(
                    "Schedule mới phải thuộc cùng chuyên khoa "
                            + "với lịch khám hiện tại"
            );
        }
    }

    private void validateAppointmentCanBeModified(
            Appointment appointment
    ) {
        if (appointment.getStatus()
                == AppointmentStatus.CANCELLED) {
            throw new IllegalStateException(
                    "Không thể cập nhật lịch đã bị hủy"
            );
        }

        if (appointment.getStatus()
                == AppointmentStatus.COMPLETED) {
            throw new IllegalStateException(
                    "Không thể cập nhật lịch đã hoàn thành"
            );
        }

        if (appointment.getStatus()
                == AppointmentStatus.NO_SHOW) {
            throw new IllegalStateException(
                    "Không thể cập nhật lịch đã được đánh dấu không đến"
            );
        }
    }

    private void validateStatusTransition(
            AppointmentStatus currentStatus,
            AppointmentStatus newStatus
    ) {
        if (currentStatus == null || newStatus == null) {
            throw new IllegalArgumentException("Trạng thái appointment không hợp lệ");
        }

        boolean validTransition = switch (currentStatus) {

            case PENDING, PENDING_PAYMENT ->
                    newStatus == AppointmentStatus.WAITING_CHECK_IN;

            case WAITING_CHECK_IN ->
                    newStatus == AppointmentStatus.WAITING_FOR_TURN
                            || newStatus == AppointmentStatus.NO_SHOW;

            case WAITING_FOR_TURN ->
                    newStatus == AppointmentStatus.COMPLETED
                            || newStatus == AppointmentStatus.NO_SHOW;

            case CANCELLED, COMPLETED, NO_SHOW -> false;
        };

        if (!validTransition) {
            throw new IllegalArgumentException(
                    "Không thể chuyển trạng thái từ "
                            + currentStatus
                            + " sang "
                            + newStatus
            );
        }
    }

    private boolean isScheduleInFuture(
            Schedule schedule
    ) {
        if (schedule.getDate().isAfter(LocalDate.now())) {
            return true;
        }

        return schedule.getDate().isEqual(LocalDate.now())
                && schedule.getStartTime()
                .isAfter(LocalTime.now());
    }

    @Override
    public List<Specialty> getAllSpecialties() {
        return specialtyRepository.findAll();
    }

    @Override
    public List<DoctorResponse> getDoctorsBySpecialty(Long specialtyId) {
        List<DoctorProfile> doctorProfiles = doctorProfileRepository.findBySpecialtyId(specialtyId);
        return doctorProfiles.stream().map(dp -> DoctorResponse.builder()
                .doctorProfileId(dp.getId())
                .userId(dp.getUser().getId())
                .fullName(dp.getUser().getFullName())
                .avatarUrl(dp.getUser().getAvatarUrl())
                .specialtyName(dp.getSpecialty() != null ? dp.getSpecialty().getName() : null)
                .build()
        ).toList();
    }

    @Override
    public AppointmentDto bookAppointment(AppointmentRequestDto request, String patientEmail) {

        User patient = userRepository.findByEmail(patientEmail)
                .orElseThrow(() -> new RuntimeException("Patient not found"));

        DoctorProfile doctor = doctorProfileRepository.findById(request.getDoctorId())
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

        LocalDate requestDate = LocalDate.parse(request.getDate());
        LocalTime requestTime = LocalTime.parse(request.getStartTime());
        Schedule schedule = getOrCreateSchedule(doctor, requestDate, requestTime);

        if (!schedule.isAvailable()) {
            throw new RuntimeException("Schedule is no longer available");
        }

        Appointment appointment = Appointment.builder()
                .patient(patient)
                .doctorProfile(doctor)
                .schedule(schedule)
                .status(AppointmentStatus.PENDING_PAYMENT)
                .reason(request.getReason())
                .type(AppointmentType.WALK_IN)
                .createdAt(LocalDateTime.now())
                .build();

        appointment = appointmentRepository.save(appointment);

        schedule.setAvailable(false);
        scheduleRepository.save(schedule);

        return mapToDto(appointment);
    }

    @Override
    public List<AppointmentDto> getPatientAppointments(String patientEmail) {
        User patient = userRepository.findByEmail(patientEmail)
                .orElseThrow(() -> new RuntimeException("Patient not found"));

        return appointmentRepository.findByPatientIdOrderByCreatedAtDesc(patient.getId())
                .stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Override
    public AppointmentDto cancelPatientAppointment(Long appointmentId, String patientEmail) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        if (!appointment.getPatient().getEmail().equals(patientEmail)) {
            throw new RuntimeException("Not authorized to cancel this appointment");
        }

        if (appointment.getStatus() != com.group_project.MASS.model.AppointmentStatus.PENDING_PAYMENT) {
            throw new RuntimeException("Không thể hủy lịch khám đã thanh toán");
        }

        appointment.setStatus(AppointmentStatus.CANCELLED);
        appointment = appointmentRepository.save(appointment);

        Schedule schedule = appointment.getSchedule();
        schedule.setAvailable(true);
        scheduleRepository.save(schedule);

        return mapToDto(appointment);
    }

    @Override
    public AppointmentDto rescheduleAppointment(Long appointmentId, RescheduleRequestDto request, String patientEmail) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        if (!appointment.getPatient().getEmail().equals(patientEmail)) {
            throw new RuntimeException("Not authorized to reschedule this appointment");
        }

        Schedule oldSchedule = appointment.getSchedule();

        LocalDate requestDate = LocalDate.parse(request.getDate());
        LocalTime requestTime = LocalTime.parse(request.getStartTime());
        Schedule newSchedule = getOrCreateSchedule(appointment.getDoctorProfile(), requestDate, requestTime);

        if (!newSchedule.isAvailable()) {
            throw new RuntimeException("New schedule is not available");
        }

        appointment.setSchedule(newSchedule);
        appointment = appointmentRepository.save(appointment);

        oldSchedule.setAvailable(true);
        scheduleRepository.save(oldSchedule);

        newSchedule.setAvailable(false);
        scheduleRepository.save(newSchedule);

        return mapToDto(appointment);
    }

    private AppointmentDto mapToDto(Appointment a) {
        String doctorName = a.getDoctorProfile() != null && a.getDoctorProfile().getUser() != null ?
            a.getDoctorProfile().getUser().getFullName() : "Unknown";
        String specialtyName = a.getDoctorProfile() != null && a.getDoctorProfile().getSpecialty() != null ?
            a.getDoctorProfile().getSpecialty().getName() : "Unknown";
        Long doctorId = a.getDoctorProfile() != null ? a.getDoctorProfile().getId() : null;

        return AppointmentDto.builder()
                .id(a.getId())
                .doctorId(doctorId)
                .doctorName(doctorName)
                .date(a.getSchedule() != null ? a.getSchedule().getDate().toString() : "")
                .time(a.getSchedule() != null ? a.getSchedule().getStartTime() + " - " + a.getSchedule().getEndTime() : "")
                .specialty(specialtyName)
                .status(a.getStatus().name())
                .reason(a.getReason())
                .build();
    }
}
