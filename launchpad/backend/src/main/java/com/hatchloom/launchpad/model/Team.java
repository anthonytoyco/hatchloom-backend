package com.hatchloom.launchpad.model;

import java.time.LocalDateTime;
import java.util.UUID;

import org.hibernate.annotations.CreationTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

/**
 * Team associated one-to-one with a {@link SideHustle}.
 *
 * <p>
 * A Team is auto-created (empty) when its parent SideHustle is created.
 * Members are added and removed individually via {@link TeamMember} records.
 * </p>
 */
@Entity
@Table(name = "teams")
public class Team {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne
    @JoinColumn(name = "side_hustle_id", nullable = false)
    private SideHustle sideHustle;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /** Default constructor required by JPA. */
    public Team() {
    }

    public UUID getId() {
        return id;
    }

    public SideHustle getSideHustle() {
        return sideHustle;
    }

    public void setSideHustle(SideHustle sideHustle) {
        this.sideHustle = sideHustle;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
