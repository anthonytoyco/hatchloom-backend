package com.hatchloom.connecthub.connecthub_service.service;

import com.hatchloom.connecthub.connecthub_service.builder.NotificationBuilder;
import com.hatchloom.connecthub.connecthub_service.dto.NotificationResponse;
import com.hatchloom.connecthub.connecthub_service.dto.NotificationSummaryResponse;
import com.hatchloom.connecthub.connecthub_service.enums.NotificationType;
import com.hatchloom.connecthub.connecthub_service.model.Notification;
import com.hatchloom.connecthub.connecthub_service.repository.ClassifiedSubscriptionRepository;
import com.hatchloom.connecthub.connecthub_service.repository.NotificationRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Service for managing notifications
 */
@Service
public class NotificationService {
    private final NotificationRepository notificationRepository;
    private final ClassifiedSubscriptionRepository classifiedSubscriptionRepository;

    public NotificationService(NotificationRepository notificationRepository, ClassifiedSubscriptionRepository classifiedSubscriptionRepository) {
        this.notificationRepository = notificationRepository;
        this.classifiedSubscriptionRepository = classifiedSubscriptionRepository;
    }

    /**
     * Creates a notification using the builder design pattern
     * and save it to the database
     * @param builder the notification builder
     */
    public void createNotification(NotificationBuilder builder) {
        Notification notification = builder.build();
        notificationRepository.save(notification);
    }

    /**
     * Get notifications for the user based on type
     * @param userId the user ID
     * @param unread whether to only get unread notifications or all notifications
     * @param type the type of notification
     * @return a list of notification responses
     */
    public List<NotificationResponse> getNotifications(UUID userId, boolean unread, NotificationType type) {
        List<Notification> notifications;

        if (unread) {
            notifications = notificationRepository.findByRecipientUserIdAndTypeAndIsReadFalseOrderByCreatedAtDesc(
                    userId, type
            );
        }
        else {
            notifications = notificationRepository.findByRecipientUserIdAndTypeOrderByCreatedAtDesc(
                    userId, type
            );
        }

        return notifications.stream().map(n -> new NotificationResponse(
                n.getId(),
                n.getRecipientUserId(),
                n.getSenderUserId(),
                n.getType(),
                n.getMessage(),
                n.getClassifiedPostId(),
                n.getConversationId(),
                n.getMessageId(),
                n.isRead(),
                n.getCreatedAt(),
                n.getReadAt()
        )).toList();
    }

    /**
     * Marks a notification as read
     * @param notificationId the notification ID to mark as read
     * @param userId the user ID of the recipient of the notification
     */
    public void markAsRead(Integer notificationId, UUID userId) {
        Optional<Notification> notification = Optional.of(notificationRepository.findById(notificationId)
                .orElseThrow(() -> new IllegalArgumentException("Notification does not exist")));

        Notification n = notification.get();
        if (!n.getRecipientUserId().equals(userId)) {
            throw new IllegalArgumentException("Notification does not belong to this user");
        }

        n.setRead(true);
        n.setReadAt(LocalDateTime.now());
        notificationRepository.save(n);
    }


    /**
     * Gets a summary of notifications for the user
     * @param userId the userID
     * @param unreadOnly whether to include only unread notifications or all
     * @param previewLimit the limit of notifications to include
     * @return a notification summary containing the count, and a preview of the notifications
     */
    public NotificationSummaryResponse getNotificationSummary(UUID userId, boolean unreadOnly, int previewLimit) {
        if (userId == null) {
            throw new IllegalArgumentException("Invalid user ID");
        }

        if (previewLimit < 0) {
            throw new IllegalArgumentException("Preview limit cannot be negative");
        }

        Integer classifiedUnreadCount = notificationRepository.countByRecipientUserIdAndTypeAndIsReadFalse(userId, NotificationType.CLASSIFIED_CREATED);
        Integer messageUnreadCount = notificationRepository.countByRecipientUserIdAndTypeAndIsReadFalse(userId, NotificationType.MESSAGE);
        Integer totalUnreadCount = classifiedUnreadCount + messageUnreadCount;

        boolean isSubscribed = classifiedSubscriptionRepository.existsByUserId(userId);

        List<NotificationResponse> classifiedNotifications = getNotifications(userId, unreadOnly, NotificationType.CLASSIFIED_CREATED)
                .stream()
                .limit(previewLimit)
                .toList();

        List<NotificationResponse> messageNotifications = getNotifications(userId, unreadOnly, NotificationType.MESSAGE)
                .stream()
                .limit(previewLimit)
                .toList();

        return new NotificationSummaryResponse(
                classifiedUnreadCount,
                messageUnreadCount,
                totalUnreadCount,
                classifiedNotifications,
                messageNotifications,
                isSubscribed
        );
    }
}
