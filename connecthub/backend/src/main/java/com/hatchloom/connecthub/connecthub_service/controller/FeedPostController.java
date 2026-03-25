package com.hatchloom.connecthub.connecthub_service.controller;

import com.hatchloom.connecthub.connecthub_service.dto.CursorResponse;
import com.hatchloom.connecthub.connecthub_service.dto.FeedPostResponse;
import com.hatchloom.connecthub.connecthub_service.dto.PostActionsResponse;
import com.hatchloom.connecthub.connecthub_service.dto.PostCreationRequest;
import com.hatchloom.connecthub.connecthub_service.model.Post;
import com.hatchloom.connecthub.connecthub_service.service.FeedActionService;
import com.hatchloom.connecthub.connecthub_service.service.FeedPostService;
import com.hatchloom.connecthub.connecthub_service.utils.JwtUtil;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * REST controller for managing feed posts, and
 * retrieving posts with pagination
 */
@RestController
@RequestMapping("/api/feed")
public class FeedPostController {
    private final FeedPostService feedPostService;
    private final JwtUtil jwtUtil;
    private final FeedActionService feedActionService;

    public FeedPostController(FeedPostService feedPostService, JwtUtil jwtUtil, FeedActionService feedActionService) {
        this.feedPostService = feedPostService;
        this.jwtUtil = jwtUtil;
        this.feedActionService = feedActionService;
    }

    @PostMapping()
    public ResponseEntity<Post> createPost(@RequestHeader("Authorization") String authHeader, @RequestBody PostCreationRequest request) {
        try {
            UUID userId = jwtUtil.extractUserId(authHeader);
            Post createdPost = feedPostService.createFeedPost(request, userId);
            return new ResponseEntity<>(createdPost, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }

    @GetMapping()
    public ResponseEntity<CursorResponse<FeedPostResponse>> getFeedPosts(@RequestHeader("Authorization") String authHeader,  @RequestParam(defaultValue = "25") Integer limit,
                                                                         @RequestParam(required = false) String after) {
        try {
            UUID userId = jwtUtil.extractUserId(authHeader);
            CursorResponse<Post> page = feedPostService.getAllFeedPosts(after, limit);

            List<FeedPostResponse> feedPostResponses = page.getData().stream()
                    .map(post -> {
                        PostActionsResponse actions = feedActionService.getPostActions(post.getId(), userId);
                        return FeedPostResponse.from(post, actions.likesCount().intValue(), actions.commentsCount().intValue(), actions.isLikedByCurrentUser(), actions.comments());
                    })
                    .toList();

            CursorResponse<FeedPostResponse> response = new CursorResponse<>(feedPostResponses, page.getNextCursor(), page.isHasNext());
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }

    @DeleteMapping("/{postId}")
    public ResponseEntity<String> deletePost(
            @PathVariable Integer postId,
            @RequestHeader("Authorization") String authHeader) {
        try {
            UUID userId = jwtUtil.extractUserId(authHeader);
            feedPostService.deleteFeedPost(postId, userId);
            return new ResponseEntity<>("Post deleted successfully", HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

}
