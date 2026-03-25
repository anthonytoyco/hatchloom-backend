package com.hatchloom.connecthub.connecthub_service.dto;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * DTO for handling message responses
 * @param id
 * @param conversationId
 * @param senderId
 * @param content
 * @param createdAt
 */
public record MessageResponse(
        UUID id,
        UUID conversationId,
        UUID senderId,
        String content,
        LocalDateTime createdAt) {

}