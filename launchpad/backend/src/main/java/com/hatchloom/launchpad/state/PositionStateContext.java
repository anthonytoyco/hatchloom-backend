package com.hatchloom.launchpad.state;

import org.springframework.stereotype.Component;

import com.hatchloom.launchpad.model.enums.PositionStatus;

/**
 * Context class for the Position State pattern.
 *
 * <p>
 * Resolves the correct {@link PositionState} for the current status, then
 * delegates the transition call to that state. Invalid transitions are rejected
 * by the state itself without any if/else logic here.
 * </p>
 *
 * <p>
 * Design Doc reference: §6 State pattern, sequence diagram p. 15.
 * </p>
 */
@Component
public class PositionStateContext {

    /**
     * Executes a status transition from {@code current} to {@code target}.
     *
     * @param current the position's current {@link PositionStatus}
     * @param target  the desired target {@link PositionStatus}
     * @return the new {@link PositionStatus} after a successful transition
     * @throws IllegalStateException    if the transition is not valid from the
     *                                  current state
     * @throws IllegalArgumentException if {@code target} is not a recognised
     *                                  transition target
     */
    public PositionStatus transition(PositionStatus current, PositionStatus target) {
        PositionState state = resolveState(current);
        return switch (target) {
            case FILLED -> state.transitionToFilled();
            case CLOSED -> state.transitionToClosed();
            default -> throw new IllegalArgumentException("Invalid target status: " + target);
        };
    }

    /**
     * Instantiates the concrete {@link PositionState} for the given status.
     *
     * @param status the current position status
     * @return the corresponding state implementation
     */
    private PositionState resolveState(PositionStatus status) {
        return switch (status) {
            case OPEN -> new OpenState();
            case FILLED -> new FilledState();
            case CLOSED -> new ClosedState();
        };
    }
}
