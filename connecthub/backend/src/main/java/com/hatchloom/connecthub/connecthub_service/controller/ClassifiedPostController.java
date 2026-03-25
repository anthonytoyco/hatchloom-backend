package com.hatchloom.connecthub.connecthub_service.controller;

import com.hatchloom.connecthub.connecthub_service.dto.*;
import com.hatchloom.connecthub.connecthub_service.model.ClassifiedPost;
import com.hatchloom.connecthub.connecthub_service.model.ClassifiedPostApplication;
import com.hatchloom.connecthub.connecthub_service.observer.ClassifiedPostFeed;
import com.hatchloom.connecthub.connecthub_service.service.ClassifiedPostService;
import com.hatchloom.connecthub.connecthub_service.utils.JwtUtil;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

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

    public ClassifiedPostController(ClassifiedPostService classifiedPostService, ClassifiedPostFeed classifiedPostFeed, JwtUtil jwtUtil) {
        this.classifiedPostService = classifiedPostService;
        this.classifiedPostFeed = classifiedPostFeed;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping()
    public ResponseEntity<ClassifiedPost> createClassified(@RequestHeader("Authorization") String authHeader, @RequestBody ClassifiedPostCreationRequest request) {
        try {
            UUID userId = jwtUtil.extractUserId(authHeader);
            ClassifiedPost createdPost = classifiedPostService.createClassifiedPost(request, userId);
            return new ResponseEntity<>(createdPost, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }

    @GetMapping()
    public ResponseEntity<CursorResponse<ClassifiedPost>> getClassifiedPosts(@RequestParam(defaultValue = "25") Integer limit
    , @RequestParam(required = false) String after, @RequestParam(defaultValue = "open") String statusType) {
        try {
            CursorResponse<ClassifiedPost> response = classifiedPostService.getAllClassifiedPosts(after, limit, statusType);
            return new ResponseEntity<>(response, HttpStatus.OK);
        }
        catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }

    @GetMapping("/filtered")
    public ResponseEntity<List<ClassifiedPost>> getFilteredClassifieds(@RequestParam String statusType) {
        try {
            List<ClassifiedPost> posts = classifiedPostService.filterClassifiedPostsByStatus(statusType);
            return new ResponseEntity<>(posts, HttpStatus.OK);
        }
        catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }

    @GetMapping("/{postId}")
    public ResponseEntity<ClassifiedPost> getClassifiedById(@PathVariable Integer postId) {
        try {
            ClassifiedPost post = classifiedPostService.getClassifiedById(postId);
            return new ResponseEntity<>(post, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }

    @PutMapping("/{postId}/status")
    public ResponseEntity<ClassifiedPost> updateClassifiedStatus(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Integer postId,
            @RequestBody UpdateClassifiedStatusRequest request) {
        try {
            UUID userId = jwtUtil.extractUserId(authHeader);
            ClassifiedPost updatedPost = classifiedPostService.updateClassifiedPostStatus(postId, userId, request.newStatus());
            return new ResponseEntity<>(updatedPost, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }

    @PostMapping("/subscriptions")
    public ResponseEntity<String> subscribe(@RequestHeader("Authorization") String authHeader) {
        try {
            UUID userId = jwtUtil.extractUserId(authHeader);
            classifiedPostFeed.subscribe(userId);
            return new ResponseEntity<>("Subscribed successfully", HttpStatus.CREATED);
        }
        catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @DeleteMapping("/subscriptions")
    public ResponseEntity<String> unsubscribe(@RequestHeader("Authorization") String authHeader) {
        try {
            UUID userId = jwtUtil.extractUserId(authHeader);
            classifiedPostFeed.unsubscribe(userId);
            return new ResponseEntity<>("Unsubscribed successfully", HttpStatus.OK);
        }
        catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @PostMapping("/{postId}/apply")
    public ResponseEntity<String> applyToClassified(@RequestHeader("Authorization") String authHeader, @PathVariable Integer postId) {
        try {
            UUID userId = jwtUtil.extractUserId(authHeader);
            classifiedPostService.applyToClassifiedPost(postId, userId);
            return new ResponseEntity<>("Application submitted successfully", HttpStatus.OK);
        }
        catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @GetMapping("/{postId}/applications")
    public ResponseEntity<List<ClassifiedPostApplication>> getApplications(@RequestHeader("Authorization") String authHeader, @PathVariable Integer postId) {
        try {
            UUID userId = jwtUtil.extractUserId(authHeader);
            List<ClassifiedPostApplication> applications = classifiedPostService.getApplicationsForClassifiedPost(postId, userId);
            return new ResponseEntity<>(applications, HttpStatus.OK);
        }
        catch (IllegalArgumentException e) {
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
        }
        catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }

}
