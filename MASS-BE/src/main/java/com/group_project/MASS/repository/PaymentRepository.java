package com.group_project.MASS.repository;

import com.group_project.MASS.model.Payment;
import com.group_project.MASS.model.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment, Long> {

    Optional<Payment> findByAppointmentId(Long appointmentId);

    Optional<Payment> findByOrderCode(Long orderCode);

    boolean existsByAppointmentId(Long appointmentId);

    boolean existsByOrderCode(Long orderCode);

    List<Payment> findByPaymentStatusOrderByCreatedAtDesc(PaymentStatus paymentStatus);
}
