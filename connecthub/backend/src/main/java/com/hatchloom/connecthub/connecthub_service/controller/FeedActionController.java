package com.hatchloom.connecthub.connecthub_service.controller;

import com.hatchloom.connecthub.connecthub_service.dto.*;
import com.hatchloom.connecthub.connecthub_service.model.FeedAction;
import com.hatchloom.connecthub.connecthub_service.service.FeedActionService;
import com.hatchloom.connecthub.connecthub_service.utils.JwtUtil;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * REST controller for managing feed actions such as liking/unliking posts and comments,
 * adding/deleting comments, and retrieving post actions and comments.
 */
@RestController
@RequestMapping("/api/feed/actions")
public class FeedActionController {
    private final FeedActionService feedActionService;
    private final JwtUtil jwtUtil;

    public FeedActionController(FeedActionService feedActionService, JwtUtil jwtUtil) {
        this.feedActionService = feedActionService;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/like")
    public ResponseEntity<String> likePost(@RequestHeader("Authorization") String authHeader, @Valid @RequestBody LikeRequest request) {
        try {
            UUID userId = jwtUtil.extractUserId(authHeader);
            feedActionService.likePost(request, userId);
            return new ResponseEntity<>("Post liked successfully", HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @DeleteMapping("/like")
    public ResponseEntity<String> unlikePost(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam Integer postId) {
        try {
            UUID userId = jwtUtil.extractUserId(authHeader);
            feedActionService.unlikePost(postId, userId);
            return new ResponseEntity<>("Post unliked successfully", HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @PostMapping("/comment")
    public ResponseEntity<CommentResponse> addComment(@RequestHeader("Authorization") String authHeader, @Valid @RequestBody CommentRequest request) {
        try {
            UUID userId = jwtUtil.extractUserId(authHeader);
            CommentResponse comment = feedActionService.addComment(request, userId);
            return new ResponseEntity<>(comment, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }

    @DeleteMapping("/comment/{commentId}")
    public ResponseEntity<String> deleteComment(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Integer commentId
            ) {
        try {
            UUID userId = jwtUtil.extractUserId(authHeader);
            feedActionService.deleteComment(commentId, userId);
            return new ResponseEntity<>("Comment deleted successfully", HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @GetMapping("/post/{postId}")
    public ResponseEntity<?> getPostActions(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Integer postId
            ) {
        try {
            UUID userId = jwtUtil.extractUserId(authHeader);
            PostActionsResponse actions = feedActionService.getPostActions(postId, userId);
            return new ResponseEntity<>(actions, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @GetMapping("/post/{postId}/comments")
    public ResponseEntity<?> getComments(@PathVariable Integer postId) {
        try {
            List<CommentResponse> comments = feedActionService.getCommentsByPostId(postId);
            return new ResponseEntity<>(comments, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }


    @GetMapping("/post/{postId}/likes/count")
    public ResponseEntity<?> getLikesCount(@PathVariable Integer postId) {
        try {
            Long count = feedActionService.getLikesCount(postId);
            return new ResponseEntity<>(count, HttpStatus.OK);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @PostMapping("/comment/{commentId}/like")
    public ResponseEntity<?> likeComment(
            @PathVariable Integer commentId,
            @RequestHeader("Authorization") String authHeader) {
        try {
            UUID userId = jwtUtil.extractUserId(authHeader);
            FeedAction like = feedActionService.likeComment(commentId, userId);
            return new ResponseEntity<>(like, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @DeleteMapping("/comment/{commentId}/like")
    public ResponseEntity<String> unlikeComment(
            @PathVariable Integer commentId,
            @RequestHeader("Authorization") String authHeader) {
        try {
            UUID userId = jwtUtil.extractUserId(authHeader);
            feedActionService.unlikeComment(commentId, userId);
            return new ResponseEntity<>("Comment unliked successfully", HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @GetMapping("/comment/{commentId}/likes/count")
    public ResponseEntity<?> getCommentLikesCount(@PathVariable Integer commentId) {
        try {
            Long count = feedActionService.getCommentLikesCount(commentId);
            return new ResponseEntity<>(count, HttpStatus.OK);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }
}


