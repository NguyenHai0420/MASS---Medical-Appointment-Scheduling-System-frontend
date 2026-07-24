package com.group_project.MASS.service;

import com.group_project.MASS.dto.response.AppointmentResponse;
import com.group_project.MASS.dto.request.CancelAppointmentRequest;
import com.group_project.MASS.dto.request.CreateWalkInAppointmentRequest;
import com.group_project.MASS.dto.request.UpdateAppointmentRequest;
import com.group_project.MASS.dto.request.UpdateAppointmentStatusRequest;
import com.group_project.MASS.dto.response.*;
import com.group_project.MASS.model.AppointmentStatus;
import com.group_project.MASS.model.Specialty;
import com.group_project.MASS.dto.AppointmentDto;
import com.group_project.MASS.dto.request.AppointmentRequestDto;
import com.group_project.MASS.dto.request.RescheduleRequestDto;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public interface AppointmentService {
    List<Specialty> getAllSpecialties();
    List<DoctorResponse> getDoctorsBySpecialty(Long specialtyId);

    List<AppointmentResponse> getMyAppointments(String email);

    PageResponse<AppointmentListResponse> getAppointments(LocalDate date, Long specialtyId, AppointmentStatus status, int page, int size);

    AppointmentDetailResponse getAppointmentDetail(Long appointmentId);

    AppointmentDetailResponse createWalkInAppointment(CreateWalkInAppointmentRequest createWalkInAppointmentRequest);

    AppointmentDetailResponse updateAppointment(Long appointmentId, UpdateAppointmentRequest updateAppointmentRequest);

    ApiMessageResponse updateAppointmentStatus(Long appointmentId, UpdateAppointmentStatusRequest updateAppointmentStatusRequest);

    ApiMessageResponse cancelAppointment(Long appointmentId, CancelAppointmentRequest cancelAppointmentRequest);

    List<AvailableScheduleResponse> getAvailableSchedules(Long specialtyId, Long doctorProfileId, LocalDate date, LocalTime fromTime);

    AppointmentDetailResponse checkInAppointment(Long appointmentId);

    AppointmentDto bookAppointment(AppointmentRequestDto request, String patientEmail);

    List<AppointmentDto> getPatientAppointments(String patientEmail);

    AppointmentDto cancelPatientAppointment(Long appointmentId, String patientEmail);

    AppointmentDto rescheduleAppointment(Long appointmentId, RescheduleRequestDto request, String patientEmail);
}
