package com.hatchloom.connecthub.connecthub_service.controller;

import com.hatchloom.connecthub.connecthub_service.dto.NotificationResponse;
import com.hatchloom.connecthub.connecthub_service.dto.NotificationSummaryResponse;
import com.hatchloom.connecthub.connecthub_service.service.NotificationService;
import com.hatchloom.connecthub.connecthub_service.utils.JwtUtil;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * REST controller for retrieving notifications for messages and classified posts,
 * and marking notifications as read
 */
@RestController
@RequestMapping("/api/notifications")
public class NotificationController {
    private final NotificationService notificationService;
    private final JwtUtil jwtUtil;

    public NotificationController(NotificationService notificationService, JwtUtil jwtUtil) {
        this.notificationService = notificationService;
        this.jwtUtil = jwtUtil;
    }

    @GetMapping("/all")
    public ResponseEntity<?> getNotificationSummary(@RequestHeader("Authorization") String authHeader, @RequestParam(defaultValue = "true") boolean unread,
                                                    @RequestParam(defaultValue = "5") int limit) {
        try {
            UUID userId = jwtUtil.extractUserId(authHeader);
            NotificationSummaryResponse summary = notificationService.getNotificationSummary(userId, unread, limit);
            return new ResponseEntity<>(summary, HttpStatus.OK);
        }
        catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @GetMapping("/classified")
    public ResponseEntity<List<NotificationResponse>> getClassifiedNotifications(@RequestHeader("Authorization") String authHeader, @RequestParam boolean unread) {
        UUID userId = jwtUtil.extractUserId(authHeader);
        return new ResponseEntity<>(notificationService.getClassifiedNotifications(userId, unread), HttpStatus.OK);
    }

    @GetMapping("/messages")
    public ResponseEntity<List<NotificationResponse>> getMessageNotifications(@RequestHeader("Authorization") String authHeader, @RequestParam boolean unread) {
        UUID userId = jwtUtil.extractUserId(authHeader);
        return new ResponseEntity<>(notificationService.getMessageNotifications(userId, unread), HttpStatus.OK);
    }

    @PatchMapping("/{notificationId}/read")
    public ResponseEntity<String> markAsRead(@RequestHeader("Authorization") String authHeader, @PathVariable Integer notificationId) {
        try {
            UUID userId = jwtUtil.extractUserId(authHeader);
            notificationService.markAsRead(notificationId, userId);
            return new ResponseEntity<>("Notification marked as read", HttpStatus.OK);
        }
        catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }
}
