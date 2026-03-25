package com.hatchloom.launchpad.factory;

import java.util.UUID;

import com.hatchloom.launchpad.model.SideHustle;
import com.hatchloom.launchpad.model.enums.SideHustleStatus;

/**
 * Concrete factory that creates {@link SideHustle} instances in the
 * {@code IN_THE_LAB} experimental stage.
 *
 * <p>
 * Plain Java class - stateless, no Spring annotation. Instantiated directly
 * by {@link SideHustleFactoryProvider} when the requested type is
 * {@code IN_THE_LAB}.
 * </p>
 */
public class InTheLabSideHustleFactory extends SideHustleFactory {

    /**
     * Creates a new SideHustle with {@code status = IN_THE_LAB} and
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
        sideHustle.setStatus(SideHustleStatus.IN_THE_LAB);
        sideHustle.setHasOpenPositions(false);
        return sideHustle;
    }
}
