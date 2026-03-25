package com.hatchloom.launchpad.model;

import java.util.UUID;

import com.hatchloom.launchpad.model.enums.PositionStatus;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

/**
 * An open role within a {@link SideHustle} that students can apply to via
 * ConnectHub.
 *
 * <p>
 * Positions are always created with {@code status = OPEN}. Transitions to
 * {@code FILLED} or {@code CLOSED} are enforced by the State pattern
 * ({@code PositionStateContext}). The status is exposed to ConnectHub via the
 * Position Status Interface: {@code GET /launchpad/positions/{id}/status}.
 * </p>
 */
@Entity
@Table(name = "positions")
public class Position {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "side_hustle_id", nullable = false)
    private SideHustle sideHustle;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PositionStatus status;

    /** Default constructor required by JPA. */
    public Position() {
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

    public PositionStatus getStatus() {
        return status;
    }

    public void setStatus(PositionStatus status) {
        this.status = status;
    }
}
