package com.hatchloom.connecthub.connecthub_service.dto;

import com.hatchloom.connecthub.connecthub_service.enums.NotificationType;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * DTO for handling notification responses
 * @param id
 * @param recipientId
 * @param senderUserId
 * @param type
 * @param message
 * @param classifiedPostId
 * @param conversationId
 * @param messageId
 * @param isRead
 * @param createdAt
 * @param readAt
 */
public record NotificationResponse(Integer id,
                                   UUID recipientId,
                                   UUID senderUserId,
                                   NotificationType type,
                                   String message,
                                   Integer classifiedPostId,
                                   UUID conversationId,
                                   UUID messageId,
                                   boolean isRead,
                                   LocalDateTime createdAt,
                                   LocalDateTime readAt) {
}
