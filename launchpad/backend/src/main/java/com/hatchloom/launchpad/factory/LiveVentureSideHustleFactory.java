package com.hatchloom.launchpad.factory;

import java.util.UUID;

import com.hatchloom.launchpad.model.SideHustle;
import com.hatchloom.launchpad.model.enums.SideHustleStatus;

/**
 * Concrete factory that creates {@link SideHustle} instances as active
 * {@code LIVE_VENTURE} ventures.
 *
 * <p>
 * Plain Java class - stateless, no Spring annotation. Instantiated directly
 * by {@link SideHustleFactoryProvider} when the requested type is
 * {@code LIVE_VENTURE}.
 * </p>
 */
public class LiveVentureSideHustleFactory extends SideHustleFactory {

    /**
     * Creates a new SideHustle with {@code status = LIVE_VENTURE} and
     * {@code hasOpenPositions = false}.
     *
     * {@inheritDoc}
     */
    @Override
    public SideHustle createSideHustle(
            String title, String description, UUID studentId, UUID sandboxId) {
        SideHustle sideHustle = new SideHustle();
        sideHustle.setTitle(title);
        sideHustle.setDescription(description);
        sideHustle.setStudentId(studentId);
        sideHustle.setStatus(SideHustleStatus.LIVE_VENTURE);
        sideHustle.setHasOpenPositions(false);
        return sideHustle;
    }
}
