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
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

/**
 * A tool or artifact attached to a {@link Sandbox}.
 *
 * <p>
 * Tools are lightweight data containers within a sandbox (e.g. notes,
 * sketches, links). A sandbox may hold any number of tools.
 * </p>
 */
@Entity
@Table(name = "sandbox_tools")
public class SandboxTool {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "sandbox_id", nullable = false)
    private Sandbox sandbox;

    @Column(name = "tool_type", nullable = false, length = 100)
    private String toolType;

    @Column(columnDefinition = "TEXT")
    private String data;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /** Default constructor required by JPA. */
    public SandboxTool() {
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

    public String getToolType() {
        return toolType;
    }

    public void setToolType(String toolType) {
        this.toolType = toolType;
    }

    public String getData() {
        return data;
    }

    public void setData(String data) {
        this.data = data;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
