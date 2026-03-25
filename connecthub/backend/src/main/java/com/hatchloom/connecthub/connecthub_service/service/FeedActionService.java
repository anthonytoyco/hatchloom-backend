package com.hatchloom.connecthub.connecthub_service.service;

import com.hatchloom.connecthub.connecthub_service.dto.CommentRequest;
import com.hatchloom.connecthub.connecthub_service.dto.CommentResponse;
import com.hatchloom.connecthub.connecthub_service.dto.LikeRequest;
import com.hatchloom.connecthub.connecthub_service.dto.PostActionsResponse;
import com.hatchloom.connecthub.connecthub_service.enums.ActionType;
import com.hatchloom.connecthub.connecthub_service.model.FeedAction;
import com.hatchloom.connecthub.connecthub_service.model.Post;
import com.hatchloom.connecthub.connecthub_service.repository.FeedActionRepository;
import com.hatchloom.connecthub.connecthub_service.repository.FeedPostRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Service class for managing feed actions such as likes and comments on posts
 */
@Service
public class FeedActionService {
    private final FeedActionRepository feedActionRepository;
    private final FeedPostRepository feedPostRepository;

    public FeedActionService(FeedActionRepository feedActionRepository, FeedPostRepository feedPostRepository) {
        this.feedActionRepository = feedActionRepository;
        this.feedPostRepository = feedPostRepository;
    }

    /**
     * Implementation for liking a post
     * @param request the like request containing post ID and user ID
     */
    @Transactional
    public void likePost(LikeRequest request, UUID userId) {
        Post post = feedPostRepository.getPostById(request.postId());
        if (post == null) {
            throw new IllegalArgumentException("Post with ID " + request.postId() + " not found");
        }

        Optional<FeedAction> existingLike = feedActionRepository.findByPostIdAndUserIdAndActionType(
                request.postId(), userId, ActionType.LIKE.getValue());

        if (existingLike.isPresent()) {
            throw new IllegalArgumentException("User has already liked this post");
        }

        FeedAction like = new FeedAction();
        like.setPost(post);
        like.setPostId(request.postId());
        like.setUserId(userId);
        like.setActionType(ActionType.LIKE.getValue());

        feedActionRepository.save(like);
    }

    /**
     * Implementation for unliking a post
     * @param postId the ID of the post to unlike
     * @param userId the ID of the user unliking the post
     */
    @Transactional
    public void unlikePost(Integer postId, UUID userId) {
        Optional<FeedAction> existingLike = feedActionRepository.findByPostIdAndUserIdAndActionType(
                postId, userId, ActionType.LIKE.getValue());

        if (existingLike.isEmpty()) {
            throw new IllegalArgumentException("User has not liked this post");
        }

        feedActionRepository.delete(existingLike.get());
    }

    /**
     * Implementation for adding a comment to a post
      * @param request the request containing post ID, user ID, and comment text
     */
    @Transactional
    public CommentResponse addComment(CommentRequest request, UUID userId) {
        Post post = feedPostRepository.getPostById(request.postId());
        if (post == null) {
            throw new IllegalArgumentException("Post with ID " + request.postId() + " not found");
        }

        if (request.commentText() == null || request.commentText().trim().isEmpty()) {
            throw new IllegalArgumentException("Comment text cannot be empty");
        }

        FeedAction comment = new FeedAction();
        comment.setPost(post);
        comment.setPostId(request.postId());
        comment.setUserId(userId);
        comment.setActionType(ActionType.COMMENT.getValue());
        comment.setCommentText(request.commentText().trim());

        feedActionRepository.save(comment);
        return new CommentResponse(comment.getId(), comment.getPostId(), comment.getUserId(), comment.getCommentText(), comment.getCreatedAt());
    }

    /**
     * Implementation for deleting a comment
     * @param commentId the ID of the comment to delete
     * @param userId the ID of the user attempting to delete the comment
     */
    @Transactional
    public void deleteComment(Integer commentId, UUID userId) {
        Optional<FeedAction> comment = feedActionRepository.findByIdAndUserIdAndActionType(
                commentId, userId, ActionType.COMMENT.getValue());

        if (comment.isEmpty()) {
            throw new IllegalArgumentException("Comment not found");
        }

        Post parentPost = feedPostRepository.getPostById(comment.get().getPostId());
        if (parentPost.getAuthor() != null && !parentPost.getAuthor().equals(userId) && !comment.get().getUserId().equals(userId)) {
            throw new IllegalArgumentException("User is not authorized to delete this comment");
        }

        feedActionRepository.delete(comment.get());
    }

    /**
     * Implementation for liking a comment
     * @param commentId the comment ID to like
     * @param userId the user ID of the person wanting to like the comment
     * @return the created like action
     */
    @Transactional
    public FeedAction likeComment(Integer commentId, UUID userId) {
        FeedAction comment = feedActionRepository.getFeedActionById(commentId);
        if (comment == null || !comment.getActionType().equals(ActionType.COMMENT.getValue())) {
            throw new IllegalArgumentException("Comment with ID " + commentId + " not found");
        }

        Optional<FeedAction> existingLike = feedActionRepository.findByParentActionIdAndUserIdAndActionType(
                commentId, userId, ActionType.LIKE.getValue());

        if (existingLike.isPresent()) {
            throw new IllegalArgumentException("User has already liked this comment");
        }
        FeedAction commentLike = new FeedAction();
        commentLike.setPost(comment.getPost());
        commentLike.setPostId(comment.getPostId());
        commentLike.setUserId(userId);
        commentLike.setActionType(ActionType.LIKE.getValue());
        commentLike.setParentActionId(commentId);

        return feedActionRepository.save(commentLike);
    }

    /**
     * Implementation for unliking a comment
     * @param commentId the comment ID to unlike
     * @param userId the user ID of the person who wants to unlike the comment
     */
    @Transactional
    public void unlikeComment(Integer commentId, UUID userId) {
        Optional<FeedAction> existingLike = feedActionRepository.findByParentActionIdAndUserIdAndActionType(
                commentId, userId, ActionType.LIKE.getValue());

        if (existingLike.isEmpty()) {
            throw new IllegalArgumentException("User has not liked this comment");
        }

        feedActionRepository.delete(existingLike.get());
    }

    /**
     * Implementation for retrieving the number of likes for a comment
     * @param commentId the comment ID to fetch
     * @return the number of likes for the comment
     */
    public Long getCommentLikesCount(Integer commentId) {
        return feedActionRepository.countLikesByCommentId(commentId);
    }

    /**
     * Implementation for retrieving post actions for a post ID
     * @param postId the post ID for which to retrieve actions
     * @param currentUserId the current user ID to check if they have liked the post
     * @return a PostActionsResponse containing the number of likes and comments, the list of comments, and whether the current user has liked the post
     */
    public PostActionsResponse getPostActions(Integer postId, UUID currentUserId) {
        Post post = feedPostRepository.getPostById(postId);
        if (post == null) {
            throw new IllegalArgumentException("Post with ID " + postId + " not found");
        }


        Long likesCount = feedActionRepository.countLikesByPostId(postId);
        Long commentsCount = feedActionRepository.countCommentsByPostId(postId);

        List<FeedAction> commentActions = feedActionRepository.findCommentsByPostId(postId);
        List<CommentResponse> comments = commentActions.stream()
                .map(action -> new CommentResponse(
                        action.getId(),
                        action.getPostId(),
                        action.getUserId(),
                        action.getCommentText(),
                        action.getCreatedAt()
                ))
                .collect(Collectors.toList());

        boolean isLikedByCurrentUser = currentUserId != null &&
                feedActionRepository.findByPostIdAndUserIdAndActionType(
                        postId, currentUserId, ActionType.LIKE.getValue()).isPresent();

        return new PostActionsResponse(postId, likesCount, commentsCount, comments, isLikedByCurrentUser);
    }

    /**
     * Implementation for retrieving comments for a post ID
     * @param postId the post ID to fetch comments for
     * @return the list of comments
     */
    public List<CommentResponse> getCommentsByPostId(Integer postId) {
        List<FeedAction> commentActions = feedActionRepository.findCommentsByPostId(postId);
        return commentActions.stream()
                .map(action -> new CommentResponse(
                        action.getId(),
                        action.getPostId(),
                        action.getUserId(),
                        action.getCommentText(),
                        action.getCreatedAt()
                ))
                .collect(Collectors.toList());
    }

    /**
     * Implementation for retrieving the number of likes for a post
     * @param postId the post ID to fetch likes count for
     * @return the number of likes for the post
     */
    public Long getLikesCount(Integer postId) {
        return feedActionRepository.countLikesByPostId(postId);
    }
}
