package com.group_project.MASS.service.impl;

import com.group_project.MASS.service.EmailService;

import com.group_project.MASS.model.Appointment;
import com.group_project.MASS.model.Payment;
import com.group_project.MASS.model.Schedule;
import com.group_project.MASS.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService{

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String senderEmail;

    public void sendOtpEmail(String toEmail, String otp) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject("Your OTP Code for Password Reset - MASS");
        message.setText("Your OTP code is: " + otp + "\nThis code will expire in 15 minutes.\nIf you did not request a password reset, please ignore this email.");
        mailSender.send(message);
    }

    @Override
    public void sendPaymentSuccessEmail(
            Appointment appointment,
            Payment payment
    ) {
        User patient = appointment.getPatient();
        Schedule schedule = appointment.getSchedule();

        SimpleMailMessage message =
                new SimpleMailMessage();

        message.setFrom(senderEmail);
        message.setTo(patient.getEmail());
        message.setSubject(
                "MASS - Thanh toán đặt lịch thành công"
        );

        message.setText(
                "Xin chào "
                        + patient.getFullName()
                        + ",\n\n"
                        + "Bạn đã thanh toán đặt lịch thành công.\n"
                        + "Bác sĩ: "
                        + appointment.getDoctorProfile()
                        .getUser()
                        .getFullName()
                        + "\n"
                        + "Chuyên khoa: "
                        + appointment.getDoctorProfile()
                        .getSpecialty()
                        .getName()
                        + "\n"
                        + "Ngày khám: "
                        + schedule.getDate()
                        + "\n"
                        + "Giờ khám: "
                        + schedule.getStartTime()
                        + "\n"
                        + "Số thứ tự: "
                        + appointment.getQueueNumber()
                        + "\n"
                        + "Số tiền: "
                        + payment.getAmount()
                        + " VND\n"
                        + "Mã giao dịch: "
                        + payment.getTransactionId()
                        + "\n\n"
                        + "Vui lòng đến trước giờ khám để check-in."
        );

        mailSender.send(message);
    }

}
