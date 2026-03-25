package com.hatchloom.launchpad.state;

import com.hatchloom.launchpad.model.enums.PositionStatus;

/**
 * State interface for the Position lifecycle.
 *
 * <p>
 * Each concrete implementation represents one valid state ({@code OPEN},
 * {@code FILLED}, {@code CLOSED}) and encapsulates which transitions are legal
 * from that state. Terminal states throw {@link IllegalStateException} on any
 * transition attempt.
 * </p>
 *
 * <p>
 * Design Doc reference: §6 State pattern.
 * </p>
 */
public interface PositionState {

    /**
     * Transitions the position to {@code FILLED}.
     *
     * @return {@link PositionStatus#FILLED}
     * @throws IllegalStateException if this state does not allow the transition
     */
    PositionStatus transitionToFilled();

    /**
     * Transitions the position to {@code CLOSED}.
     *
     * @return {@link PositionStatus#CLOSED}
     * @throws IllegalStateException if this state does not allow the transition
     */
    PositionStatus transitionToClosed();
}
