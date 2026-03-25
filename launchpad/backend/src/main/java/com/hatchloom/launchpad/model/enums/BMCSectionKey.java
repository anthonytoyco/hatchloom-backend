package com.hatchloom.launchpad.model.enums;

/**
 * Enumeration of the nine sections of a Business Model Canvas.
 *
 * <p>
 * Used to validate and map PATCH requests to the correct BMC field,
 * preventing magic strings in service layer logic.
 * </p>
 */
public enum BMCSectionKey {
    KEY_PARTNERS,
    KEY_ACTIVITIES,
    KEY_RESOURCES,
    VALUE_PROPOSITIONS,
    CUSTOMER_RELATIONSHIPS,
    CHANNELS,
    CUSTOMER_SEGMENTS,
    COST_STRUCTURE,
    REVENUE_STREAMS
}
