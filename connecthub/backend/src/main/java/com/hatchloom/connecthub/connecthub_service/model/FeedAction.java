package com.hatchloom.connecthub.connecthub_service.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Entity representing feed actions, which can be
 * likes or comments on posts
 */
@Entity
@Table(name = "feed_actions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class FeedAction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "post_id", nullable = false, updatable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Post post;

    @Column(name = "post_id", nullable = false, insertable = false, updatable = false)
    private Integer postId;

    @Column(name = "user_id", nullable = false, updatable = false, columnDefinition = "UUID")
    private UUID userId;

    @Column(name = "action_type", nullable = false, length = 20)
    private String actionType;

    @Column(name = "comment_text", columnDefinition = "TEXT")
    private String commentText;

    @Column(name = "parent_action_id")
    private Integer parentActionId;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
