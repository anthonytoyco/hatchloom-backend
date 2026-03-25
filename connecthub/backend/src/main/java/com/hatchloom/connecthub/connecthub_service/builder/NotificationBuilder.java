package com.hatchloom.connecthub.connecthub_service.builder;

import com.hatchloom.connecthub.connecthub_service.enums.NotificationType;
import com.hatchloom.connecthub.connecthub_service.model.Notification;

import java.util.UUID;

/**
 * Concrete builder class for creating Notification objects
 */
public class NotificationBuilder implements Builder {
    private UUID recipientUserId;
    private UUID senderUserId;
    private NotificationType type;
    private String message;
    private Integer classifiedPostId;
    private UUID conversationId;
    private UUID messageId;

    @Override
    public NotificationBuilder setRecipientUserId(UUID recipientUserId) {
        this.recipientUserId = recipientUserId;
        return this;
    }

    @Override
    public NotificationBuilder setSenderUserId(UUID senderId) {
        this.senderUserId = senderId;
        return this;
    }

    @Override
    public NotificationBuilder setType(NotificationType type) {
        this.type = type;
        return this;
    }

    @Override
    public NotificationBuilder setMessage(String message) {
        this.message = message;
        return this;
    }

    @Override
    public NotificationBuilder setClassifiedPostId(Integer classifiedPostId) {
        this.classifiedPostId = classifiedPostId;
        return this;
    }

    @Override
    public NotificationBuilder setConversationId(UUID conversationId) {
        this.conversationId = conversationId;
        return this;
    }

    @Override
    public NotificationBuilder setMessageId(UUID messageId) {
        this.messageId = messageId;
        return this;
    }

    /**
     * Builds and return a Notification object
     * @return Notification
     */
    @Override
    public Notification build() {
        if (recipientUserId == null || senderUserId == null || type == null || message == null) {
            throw new IllegalStateException("RecipientUserId, SenderUserId, Type, and Message are required fields.");
        }

        Notification notification = new Notification();
        notification.setRecipientUserId(recipientUserId);
        notification.setSenderUserId(senderUserId);
        notification.setType(type);
        notification.setMessage(message);
        notification.setClassifiedPostId(classifiedPostId);
        notification.setConversationId(conversationId);
        notification.setMessageId(messageId);
        return notification;
    }
}
