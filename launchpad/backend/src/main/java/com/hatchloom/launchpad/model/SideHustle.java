package com.hatchloom.launchpad.model;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import com.hatchloom.launchpad.model.enums.SideHustleStatus;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

/**
 * Represents a SideHustle venture owned by a student.
 *
 * <p>
 * A SideHustle is the parent of a {@link BusinessModelCanvas}, a {@link Team},
 * and zero or more {@link Position}s. It is created via the Factory Method
 * pattern
 * and transitions between {@code IN_THE_LAB} and {@code LIVE_VENTURE} status.
 * </p>
 *
 * <p>
 * The {@code hasOpenPositions} flag is maintained by {@code PositionService}
 * whenever a position is created or its status changes.
 * </p>
 */
@Entity
@Table(name = "side_hustles")
public class SideHustle {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "sandbox_id")
    private Sandbox sandbox;

    @Column(name = "student_id", nullable = false)
    private UUID studentId;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private SideHustleStatus status;

    @Column(name = "has_open_positions", nullable = false)
    private boolean hasOpenPositions;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @OneToOne(mappedBy = "sideHustle", cascade = CascadeType.ALL, orphanRemoval = true)
    private BusinessModelCanvas bmc;

    @OneToOne(mappedBy = "sideHustle", cascade = CascadeType.ALL, orphanRemoval = true)
    private Team team;

    @OneToMany(mappedBy = "sideHustle", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Position> positions;

    /** Default constructor required by JPA. */
    public SideHustle() {
    }

    public UUID getId() {
        return id;
    }

    public Sandbox getSandbox() {
        return sandbox;
    }

    public void setSandbox(Sandbox sandbox) {
        this.sandbox = sandbox;
    }

    public UUID getStudentId() {
        return studentId;
    }

    public void setStudentId(UUID studentId) {
        this.studentId = studentId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public SideHustleStatus getStatus() {
        return status;
    }

    public void setStatus(SideHustleStatus status) {
        this.status = status;
    }

    public boolean isHasOpenPositions() {
        return hasOpenPositions;
    }

    public void setHasOpenPositions(boolean hasOpenPositions) {
        this.hasOpenPositions = hasOpenPositions;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public BusinessModelCanvas getBmc() {
        return bmc;
    }

    public Team getTeam() {
        return team;
    }
}
