package com.hatchloom.connecthub.connecthub_service.dto;

import com.hatchloom.connecthub.connecthub_service.model.Post;

import java.util.List;
import java.util.UUID;

/**
 * DTO for handling feed post responses
 * @param id
 * @param title
 * @param content
 * @param author
 * @param postType
 * @param createdAt
 */
public record FeedPostResponse(
        Integer id,
        String title,
        String content,
        UUID author,
        String postType,
        String createdAt,
        Integer likeCount,
        Integer commentCount,
        Boolean likedByCurrentUser,
        List<CommentResponse> comments
) {
    public static FeedPostResponse from(Post p, Integer likeCount, Integer commentCount, Boolean likedByCurrentUser, List<CommentResponse> comments) {
        return new FeedPostResponse(
                p.getId(),
                p.getTitle(),
                p.getContent(),
                p.getAuthor(),
                p.getPostType(),
                p.getCreatedAt().toString(),
                likeCount,
                commentCount,
                likedByCurrentUser,
                comments
        );
    }
}
