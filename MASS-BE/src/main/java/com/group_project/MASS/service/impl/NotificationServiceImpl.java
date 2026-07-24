package com.group_project.MASS.service.impl;

import com.group_project.MASS.service.NotificationService;

import com.group_project.MASS.model.Appointment;
import com.group_project.MASS.model.Notification;
import com.group_project.MASS.model.Payment;
import com.group_project.MASS.model.Schedule;
import com.group_project.MASS.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Transactional
public class NotificationServiceImpl implements NotificationService{
    private final NotificationRepository
            notificationRepository;

    @Override
    public void createPaymentSuccessNotification(
            Appointment appointment,
            Payment payment
    ) {
        Schedule schedule = appointment.getSchedule();

        String message =
                "Thanh toán đặt lịch thành công. "
                        + "Ngày khám: "
                        + schedule.getDate()
                        + ", giờ khám: "
                        + schedule.getStartTime()
                        + ", số thứ tự: "
                        + appointment.getQueueNumber()
                        + ".";

        Notification notification =
                Notification.builder()
                        .user(appointment.getPatient())
                        .title(
                                "Đặt lịch khám thành công"
                        )
                        .message(message)
                        .isRead(false)
                        .createdAt(LocalDateTime.now())
                        .build();

        notificationRepository.save(notification);
    }
}
