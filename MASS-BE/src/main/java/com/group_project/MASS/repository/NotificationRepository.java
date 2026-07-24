package com.group_project.MASS.repository;

import com.group_project.MASS.model.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface NotificationRepository extends JpaRepository<Notification,Long> {

    Page<Notification> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable page);

    List<Notification> findByUserIdAndIsReadFalseOrderByCreatedAtDesc(Long userId);

    Long countByUserIdAndIsReadFalse(Long userId);

    Optional<Notification> findByIdAndUserId(Long notificationId, Long userId);
}
