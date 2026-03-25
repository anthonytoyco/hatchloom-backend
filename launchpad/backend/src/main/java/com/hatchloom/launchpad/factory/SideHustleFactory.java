package com.hatchloom.launchpad.factory;

import java.util.UUID;

import com.hatchloom.launchpad.model.SideHustle;

/**
 * Abstract factory for creating {@link SideHustle} instances.
 *
 * <p>
 * Concrete subclasses determine the correct {@code SideHustleStatus} and any
 * subtype-specific defaults. The factory decouples creation logic from the
 * service layer and satisfies the Open/Closed Principle - adding a new
 * SideHustle
 * type requires only a new subclass and a mapping in
 * {@link SideHustleFactoryProvider},
 * with no changes to existing code.
 * </p>
 *
 * <p>
 * Design Doc reference: §6 Factory Method pattern, Test ID TC-Q2-001.
 * </p>
 */
public abstract class SideHustleFactory {

    /**
     * Creates and returns a new, unpersisted {@link SideHustle} with all fields
     * populated and the appropriate status set by the concrete factory.
     *
     * @param title       the SideHustle title
     * @param description the SideHustle description (may be null)
     * @param studentId   UUID of the owning student
     * @param sandboxId   UUID of the originating sandbox (may be null)
     * @return a new SideHustle entity ready for persistence
     */
    public abstract SideHustle createSideHustle(
            String title, String description, UUID studentId, UUID sandboxId);
}
