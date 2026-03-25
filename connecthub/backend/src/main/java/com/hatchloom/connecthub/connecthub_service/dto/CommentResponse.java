package com.hatchloom.connecthub.connecthub_service.dto;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * DTO for handling comment responses
 * @param id
 * @param postId
 * @param userId
 * @param commentText
 * @param createdAt
 */
public record CommentResponse(
        Integer id,
        Integer postId,
        UUID userId,
        String commentText,
        LocalDateTime createdAt
) {
}

