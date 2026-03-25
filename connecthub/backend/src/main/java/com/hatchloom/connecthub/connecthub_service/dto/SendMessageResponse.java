package com.hatchloom.connecthub.connecthub_service.dto;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * DTO for handling send message responses
 * @param conversationId
 * @param messageId
 * @param senderId
 * @param recipientId
 * @param content
 * @param createdAt
 */
public record SendMessageResponse(
UUID conversationId,
  UUID messageId,
  UUID senderId,
  UUID recipientId,
  String content,
  LocalDateTime createdAt) {
}
