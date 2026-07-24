package com.group_project.MASS.mapper;

import com.group_project.MASS.dto.response.AppointmentDetailResponse;
import com.group_project.MASS.dto.response.AppointmentListResponse;
import com.group_project.MASS.dto.response.AvailableScheduleResponse;
import com.group_project.MASS.model.Appointment;
import com.group_project.MASS.model.Payment;
import com.group_project.MASS.model.PaymentStatus;
import com.group_project.MASS.model.Schedule;

public final class AppointmentMapper {

    private AppointmentMapper() {

    }

    public static AppointmentListResponse toListResponse(Appointment appointment,
                                                         Payment payment) {

        boolean paid = payment != null
                && payment.getPaymentStatus() == PaymentStatus.COMPLETED;

        return AppointmentListResponse.builder()
                .appointmentId(appointment.getId())
                .patientId(appointment.getPatient().getId())
                .patientName(appointment.getPatient().getFullName())
                .patientEmail(appointment.getPatient().getEmail())
                .patientPhone(appointment.getPatient().getPhone())
                .doctorProfileId(appointment.getDoctorProfile().getId())
                .doctorName(appointment.getDoctorProfile().getUser().getFullName())
                .specialtyId(appointment.getDoctorProfile().getSpecialty().getId())
                .specialtyName(appointment.getDoctorProfile().getSpecialty().getName())
                .scheduleId(appointment.getSchedule().getId())
                .appointmentDate(appointment.getSchedule().getDate())
                .startTime(appointment.getSchedule().getStartTime())
                .endTime(appointment.getSchedule().getEndTime())
                .queueNumber(appointment.getQueueNumber())
                .appointmentStatus(appointment.getStatus())
                .appointmentType(appointment.getType())
                .paymentStatus(payment != null ? payment.getPaymentStatus() : null)
                .paid(paid)
                .build();
    }

    public static AppointmentDetailResponse toDetailResponse(Appointment appointment,
                                                             Payment payment) {

        boolean paid = payment != null
                && payment.getPaymentStatus() == PaymentStatus.COMPLETED;

        AppointmentDetailResponse.AppointmentDetailResponseBuilder builder =
                AppointmentDetailResponse.builder()
                .appointmentId(appointment.getId())
                .patientId(appointment.getPatient().getId())
                .patientName(appointment.getPatient().getFullName())
                .patientEmail(appointment.getPatient().getEmail())
                .patientPhone(appointment.getPatient().getPhone())
                .patientGender(appointment.getPatient().getGender())
                .patientDateOfBirth(appointment.getPatient().getDateOfBirth())
                .patientAddress(appointment.getPatient().getAddress())
                .doctorProfileId(appointment.getDoctorProfile().getId())
                .doctorUserId(appointment.getDoctorProfile().getUser().getId())
                .doctorName(appointment.getDoctorProfile().getUser().getFullName())
                .doctorDegree(appointment.getDoctorProfile().getDegree())
                .doctorExpertise(appointment.getDoctorProfile().getExperience())
                .specialtyId(appointment.getDoctorProfile().getSpecialty().getId())
                .specialtyName(appointment.getDoctorProfile().getSpecialty().getName())
                .scheduleId(appointment.getSchedule().getId())
                .appointmentDate(appointment.getSchedule().getDate())
                .startTime(appointment.getSchedule().getStartTime())
                .endTime(appointment.getSchedule().getEndTime())
                .queueNumber(appointment.getQueueNumber())
                .reason(appointment.getReason())
                .appointmentType(appointment.getType())
                .appointmentStatus(appointment.getStatus())
                .createdAt(appointment.getCreatedAt())
                .paid(paid);

        if(payment != null) {
            builder
                    .paymentId(payment.getId())
                    .paymentAmount(payment.getAmount())
                    .paymentMethod(payment.getPaymentMethod())
                    .paymentStatus(payment.getPaymentStatus())
                    .orderCode(payment.getOrderCode())
                    .transactionId(payment.getTransactionId())
                    .paymentDate(payment.getPaymentDate());
        }
        return builder.build();
    }

    public static AvailableScheduleResponse toScheduleResponse(Schedule schedule,
                                                               Integer queueNumber) {
        return AvailableScheduleResponse.builder()
                .scheduleId(schedule.getId())
                .doctorProfileId(schedule.getDoctorProfile().getId())
                .doctorName(schedule.getDoctorProfile().getUser().getFullName())
                .specialtyId(schedule.getDoctorProfile().getSpecialty().getId())
                .specialtyName(schedule.getDoctorProfile().getSpecialty().getName())
                .date(schedule.getDate())
                .startTime(schedule.getStartTime())
                .endTime(schedule.getEndTime())
                .queueNumber(queueNumber)
                .build();
    }

}

