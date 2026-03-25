package com.hatchloom.connecthub.connecthub_service.model;

import com.hatchloom.connecthub.connecthub_service.enums.NotificationType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Entity representing a notification sent to a user,
 * triggered by classified post updates, or new messages
 */
@Entity
@Table(name = "notifications")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "recipient_user_id", nullable = false, columnDefinition = "UUID")
    private UUID recipientUserId;

    @Column(name = "sender_user_id", nullable = false, columnDefinition = "UUID")
    private UUID senderUserId;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false)
    private NotificationType type;

    @Column(name = "message", nullable = false, columnDefinition = "TEXT")
    private String message;

    @Column(name = "classified_post_id")
    private Integer classifiedPostId;

    @Column(name = "conversation_id", columnDefinition = "UUID")
    private UUID conversationId;

    @Column(name = "message_id", columnDefinition = "UUID")
    private UUID messageId;

    @Column(name = "is_read", nullable = false)
    private boolean isRead = false;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "read_at")
    private LocalDateTime readAt;
}
