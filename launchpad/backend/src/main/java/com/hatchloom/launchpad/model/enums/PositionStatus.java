package com.hatchloom.launchpad.model.enums;

/**
 * Lifecycle status of a Position within a SideHustle.
 *
 * <ul>
 * <li>{@code OPEN} - position is available and accepting applicants</li>
 * <li>{@code FILLED} - position has been filled (terminal state)</li>
 * <li>{@code CLOSED} - position was closed without being filled (terminal
 * state)</li>
 * </ul>
 *
 * <p>
 * Valid transitions: {@code OPEN → FILLED}, {@code OPEN → CLOSED}.
 * {@code FILLED} and {@code CLOSED} are terminal - no further transitions
 * allowed.
 * </p>
 */
public enum PositionStatus {
    OPEN,
    FILLED,
    CLOSED
}
