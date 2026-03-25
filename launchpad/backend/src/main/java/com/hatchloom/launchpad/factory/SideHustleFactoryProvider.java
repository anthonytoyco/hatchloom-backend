package com.hatchloom.launchpad.factory;

import org.springframework.stereotype.Component;

import com.hatchloom.launchpad.model.enums.SideHustleStatus;

/**
 * Spring-managed provider that resolves the correct {@link SideHustleFactory}
 * for a given {@link SideHustleStatus}.
 *
 * <p>
 * This is the only Spring bean in the factory package. The concrete factories
 * ({@link InTheLabSideHustleFactory}, {@link LiveVentureSideHustleFactory}) are
 * stateless and are instantiated directly - they require no injection.
 * </p>
 *
 * <p>
 * Design Doc reference: §6 Factory Method pattern.
 * </p>
 */
@Component
public class SideHustleFactoryProvider {

    /**
     * Returns the factory for the given SideHustle type.
     *
     * @param type the desired {@link SideHustleStatus}
     * @return the matching {@link SideHustleFactory} instance
     * @throws IllegalArgumentException if {@code type} is not a recognised status
     */
    public SideHustleFactory getFactory(SideHustleStatus type) {
        return switch (type) {
            case IN_THE_LAB -> new InTheLabSideHustleFactory();
            case LIVE_VENTURE -> new LiveVentureSideHustleFactory();
        };
    }
}
