package com.group_project.MASS.dto.response;

import com.group_project.MASS.model.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AppointmentDetailResponse {
    private Long appointmentId;

    private Long patientId;
    private String patientName;
    private String patientEmail;
    private String patientPhone;
    private String patientGender;
    private LocalDate patientDateOfBirth;
    private String patientAddress;

    private Long doctorProfileId;
    private Long doctorUserId;
    private String doctorName;
    private String doctorDegree;
    private String doctorExpertise;
    private Long specialtyId;
    private String specialtyName;

    private Long scheduleId;
    private LocalDate appointmentDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private Integer queueNumber;
    private String reason;
    private AppointmentType appointmentType;
    private AppointmentStatus appointmentStatus;
    private LocalDateTime createdAt;

    private Long paymentId;
    private BigDecimal paymentAmount;
    private PaymentMethod paymentMethod;
    private PaymentStatus paymentStatus;
    private Long orderCode;
    private String transactionId;
    private LocalDateTime paymentDate;
    private boolean paid;
}
