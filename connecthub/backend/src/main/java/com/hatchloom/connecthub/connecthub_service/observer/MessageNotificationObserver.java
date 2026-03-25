package com.hatchloom.connecthub.connecthub_service.observer;

import com.hatchloom.connecthub.connecthub_service.builder.NotificationBuilder;
import com.hatchloom.connecthub.connecthub_service.enums.NotificationType;
import com.hatchloom.connecthub.connecthub_service.model.Messages;
import com.hatchloom.connecthub.connecthub_service.service.NotificationService;
import org.springframework.stereotype.Component;

import java.util.UUID;

/**
 * Observer implementation that listens for new messages and creates notifications for the recipients
 */
@Component
public class MessageNotificationObserver implements MessageObserver {
    private final NotificationService notificationService;

    public MessageNotificationObserver(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    /**
     * When a new message is received, create a notification for the recipient user
     * @param message the incoming message that triggered the notification
     * @param receiverUserId the ID of the user who should receive the notification
     */
    @Override
    public void update(Messages message, UUID receiverUserId) {
        notificationService.createNotification(new NotificationBuilder()
                .setRecipientUserId(receiverUserId)
                .setSenderUserId(message.getSenderId())
                .setType(NotificationType.MESSAGE)
                .setMessage("You received a new message")
                .setConversationId(message.getConversationId())
                .setMessageId(message.getId()));
    }
}
