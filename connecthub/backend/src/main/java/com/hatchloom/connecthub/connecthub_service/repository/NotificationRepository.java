package com.hatchloom.connecthub.connecthub_service.repository;

import com.hatchloom.connecthub.connecthub_service.enums.NotificationType;
import com.hatchloom.connecthub.connecthub_service.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

/**
 * Repository interface for managing Notification entities
 */
public interface NotificationRepository extends JpaRepository<Notification, Integer> {
    List<Notification> findByRecipientUserIdAndTypeOrderByCreatedAtDesc(UUID recipientUserId, NotificationType type);
    List<Notification> findByRecipientUserIdAndTypeAndIsReadFalseOrderByCreatedAtDesc(UUID recipientUserId, NotificationType type);

    Integer countByRecipientUserIdAndTypeAndIsReadFalse(UUID recipientUserId, NotificationType type);
}
