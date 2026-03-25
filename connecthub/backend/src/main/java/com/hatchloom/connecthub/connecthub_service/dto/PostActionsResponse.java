package com.hatchloom.connecthub.connecthub_service.dto;

import java.util.List;

/**
 * DTO for handling post actions responses, including likes and comments
 * @param postId
 * @param likesCount
 * @param commentsCount
 * @param comments
 * @param isLikedByCurrentUser
 */
public record PostActionsResponse(
        Integer postId,
        Long likesCount,
        Long commentsCount,
        List<CommentResponse> comments,
        boolean isLikedByCurrentUser
) {
}

