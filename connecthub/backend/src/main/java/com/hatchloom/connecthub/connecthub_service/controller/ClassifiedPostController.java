package com.hatchloom.connecthub.connecthub_service.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.hatchloom.connecthub.connecthub_service.dto.ApplicationResponse;
import com.hatchloom.connecthub.connecthub_service.dto.ClassifiedPostCreationRequest;
import com.hatchloom.connecthub.connecthub_service.dto.CursorResponse;
import com.hatchloom.connecthub.connecthub_service.dto.UpdateClassifiedStatusRequest;
import com.hatchloom.connecthub.connecthub_service.model.ClassifiedPost;
import com.hatchloom.connecthub.connecthub_service.model.ClassifiedPostApplication;
import com.hatchloom.connecthub.connecthub_service.observer.ClassifiedPostFeed;
import com.hatchloom.connecthub.connecthub_service.service.ClassifiedPostService;
import com.hatchloom.connecthub.connecthub_service.utils.JwtUtil;

/**
 * REST controller for managing classified posts,
 * updating status, and handling subscriptions to the classified post feed.
 */
@RestController
@RequestMapping("/api/classified")
public class ClassifiedPostController {
    private final ClassifiedPostService classifiedPostService;
    private final ClassifiedPostFeed classifiedPostFeed;
    private final JwtUtil jwtUtil;

    public ClassifiedPostController(ClassifiedPostService classifiedPostService, ClassifiedPostFeed classifiedPostFeed,
            JwtUtil jwtUtil) {
        this.classifiedPostService = classifiedPostService;
        this.classifiedPostFeed = classifiedPostFeed;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping()
    public ResponseEntity<?> createClassified(@RequestHeader("Authorization") String authHeader,
            @RequestBody ClassifiedPostCreationRequest request) {
        try {
            UUID userId = jwtUtil.extractUserId(authHeader);
            ClassifiedPost createdPost = classifiedPostService.createClassifiedPost(request, userId);
            return new ResponseEntity<>(createdPost, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @GetMapping()
    public ResponseEntity<?> getClassifiedPosts(@RequestParam(defaultValue = "25") Integer limit,
            @RequestParam(required = false) String after, @RequestParam(defaultValue = "open") String statusType) {
        try {
            CursorResponse<ClassifiedPost> response = classifiedPostService.getAllClassifiedPosts(after, limit,
                    statusType);
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @GetMapping("/filtered")
    public ResponseEntity<?> getFilteredClassifieds(@RequestParam String statusType) {
        try {
            List<ClassifiedPost> posts = classifiedPostService.filterClassifiedPostsByStatus(statusType);
            return new ResponseEntity<>(posts, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @GetMapping("/{postId}")
    public ResponseEntity<?> getClassifiedById(@PathVariable Integer postId) {
        try {
            ClassifiedPost post = classifiedPostService.getClassifiedById(postId);
            return new ResponseEntity<>(post, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    /**
     * Returns the classified post linked to a specific LaunchPad position, or 404
     * if none.
     * Used by the LaunchPad frontend to check whether a position already has a
     * classified post.
     */
    @GetMapping("/by-position/{positionId}")
    public ResponseEntity<ClassifiedPost> getClassifiedByPositionId(@PathVariable UUID positionId) {
        return classifiedPostService.getClassifiedByPositionId(positionId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().<ClassifiedPost>build());
    }

    @PutMapping("/{postId}/status")
    public ResponseEntity<?> updateClassifiedStatus(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Integer postId,
            @RequestBody UpdateClassifiedStatusRequest request) {
        try {
            UUID userId = jwtUtil.extractUserId(authHeader);
            ClassifiedPost updatedPost = classifiedPostService.updateClassifiedPostStatus(postId, userId,
                    request.newStatus());
            return new ResponseEntity<>(updatedPost, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @PostMapping("/subscriptions")
    public ResponseEntity<String> subscribe(@RequestHeader("Authorization") String authHeader) {
        try {
            UUID userId = jwtUtil.extractUserId(authHeader);
            classifiedPostFeed.subscribe(userId);
            return new ResponseEntity<>("Subscribed successfully", HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @DeleteMapping("/subscriptions")
    public ResponseEntity<String> unsubscribe(@RequestHeader("Authorization") String authHeader) {
        try {
            UUID userId = jwtUtil.extractUserId(authHeader);
            classifiedPostFeed.unsubscribe(userId);
            return new ResponseEntity<>("Unsubscribed successfully", HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @PostMapping("/{postId}/apply")
    public ResponseEntity<String> applyToClassified(@RequestHeader("Authorization") String authHeader,
            @PathVariable Integer postId) {
        try {
            UUID userId = jwtUtil.extractUserId(authHeader);
            classifiedPostService.applyToClassifiedPost(postId, userId);
            return new ResponseEntity<>("Application submitted successfully", HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @GetMapping("/{postId}/applications")
    public ResponseEntity<List<ClassifiedPostApplication>> getApplications(
            @RequestHeader("Authorization") String authHeader, @PathVariable Integer postId) {
        try {
            UUID userId = jwtUtil.extractUserId(authHeader);
            List<ClassifiedPostApplication> applications = classifiedPostService
                    .getApplicationsForClassifiedPost(postId, userId);
            return new ResponseEntity<>(applications, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }

    @GetMapping("/applications/me")
    public ResponseEntity<ApplicationResponse> getMyApplications(@RequestHeader("Authorization") String authHeader) {
        try {
            UUID userId = jwtUtil.extractUserId(authHeader);
            List<ClassifiedPost> posts = classifiedPostService.getAppliedClassifiedPostsByUser(userId);
            Integer totalApplications = classifiedPostService.getTotalApplicationsForAuthor(userId);
            ApplicationResponse response = new ApplicationResponse(posts, totalApplications);
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }

}
