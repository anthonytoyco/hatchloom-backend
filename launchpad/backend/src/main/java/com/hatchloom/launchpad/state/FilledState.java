package com.hatchloom.launchpad.state;

import com.hatchloom.launchpad.model.enums.PositionStatus;

/**
 * State implementation for a position in the {@code FILLED} terminal state.
 *
 * <p>
 * No further transitions are allowed. Both methods throw
 * {@link IllegalStateException}.
 * </p>
 */
public class FilledState implements PositionState {

    /**
     * {@inheritDoc}
     *
     * @throws IllegalStateException always - FILLED is a terminal state
     */
    @Override
    public PositionStatus transitionToFilled() {
        throw new IllegalStateException("Position is already FILLED, cannot transition.");
    }

    /**
     * {@inheritDoc}
     *
     * @throws IllegalStateException always - FILLED is a terminal state
     */
    @Override
    public PositionStatus transitionToClosed() {
        throw new IllegalStateException("Position is already FILLED, cannot transition.");
    }
}
