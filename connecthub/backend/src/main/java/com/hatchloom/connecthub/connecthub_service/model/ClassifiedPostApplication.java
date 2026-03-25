package com.hatchloom.connecthub.connecthub_service.model;

import com.hatchloom.connecthub.connecthub_service.enums.ApplicationStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Entity representing an application to a classified post
 */
@Entity
@Table(name = "classified_post_applications",
        uniqueConstraints = @UniqueConstraint(columnNames = {"classified_post_id", "applicant_id"}))
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ClassifiedPostApplication {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "classified_post_id", nullable = false, updatable = false)
    private ClassifiedPost classifiedPost;

    @Column(name = "applicant_id", nullable = false, columnDefinition = "UUID", updatable = false)
    private UUID applicantId;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private ApplicationStatus status = ApplicationStatus.APPLIED;

    @CreationTimestamp
    @Column(name = "applied_at", nullable = false, updatable = false)
    private LocalDateTime appliedAt;
}
