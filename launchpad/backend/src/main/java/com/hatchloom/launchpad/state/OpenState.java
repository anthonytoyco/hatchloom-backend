package com.hatchloom.launchpad.state;

import com.hatchloom.launchpad.model.enums.PositionStatus;

/**
 * State implementation for a position in the {@code OPEN} state.
 *
 * <p>Both transitions ({@code FILLED} and {@code CLOSED}) are valid from here.</p>
 */
public class OpenState implements PositionState {

    /**
     * {@inheritDoc}
     *
     * @return {@link PositionStatus#FILLED}
     */
    @Override
    public PositionStatus transitionToFilled() {
        return PositionStatus.FILLED;
    }

    /**
     * {@inheritDoc}
     *
     * @return {@link PositionStatus#CLOSED}
     */
    @Override
    public PositionStatus transitionToClosed() {
        return PositionStatus.CLOSED;
    }
}
