package com.hatchloom.connecthub.connecthub_service.builder;

import com.hatchloom.connecthub.connecthub_service.enums.NotificationType;
import com.hatchloom.connecthub.connecthub_service.model.Notification;

import java.util.UUID;

/**
 * Builder design pattern interface for creating Notification objects
 */
public interface Builder {
    Builder setRecipientUserId(UUID recipientId);
    Builder setSenderUserId(UUID senderId);
    Builder setType(NotificationType type);
    Builder setMessage(String message);
    Builder setClassifiedPostId(Integer classifiedPostId);
    Builder setConversationId(UUID conversationId);
    Builder setMessageId(UUID messageId);
    Notification build();
}
