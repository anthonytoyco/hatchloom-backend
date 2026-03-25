package com.hatchloom.launchpad.dto.response;

import java.util.UUID;

import com.hatchloom.launchpad.model.BusinessModelCanvas;

/**
 * Response body representing a full Business Model Canvas with all nine
 * sections.
 */
public class BMCResponse {

    private UUID id;
    private UUID sideHustleId;
    private String keyPartners;
    private String keyActivities;
    private String keyResources;
    private String valuePropositions;
    private String customerRelationships;
    private String channels;
    private String customerSegments;
    private String costStructure;
    private String revenueStreams;

    /**
     * Maps a {@link BusinessModelCanvas} entity to a {@link BMCResponse}.
     *
     * @param bmc the entity to map
     * @return the response DTO
     */
    public static BMCResponse from(BusinessModelCanvas bmc) {
        BMCResponse r = new BMCResponse();
        r.id = bmc.getId();
        r.sideHustleId = bmc.getSideHustle().getId();
        r.keyPartners = bmc.getKeyPartners();
        r.keyActivities = bmc.getKeyActivities();
        r.keyResources = bmc.getKeyResources();
        r.valuePropositions = bmc.getValuePropositions();
        r.customerRelationships = bmc.getCustomerRelationships();
        r.channels = bmc.getChannels();
        r.customerSegments = bmc.getCustomerSegments();
        r.costStructure = bmc.getCostStructure();
        r.revenueStreams = bmc.getRevenueStreams();
        return r;
    }

    public UUID getId() {
        return id;
    }

    public UUID getSideHustleId() {
        return sideHustleId;
    }

    public String getKeyPartners() {
        return keyPartners;
    }

    public String getKeyActivities() {
        return keyActivities;
    }

    public String getKeyResources() {
        return keyResources;
    }

    public String getValuePropositions() {
        return valuePropositions;
    }

    public String getCustomerRelationships() {
        return customerRelationships;
    }

    public String getChannels() {
        return channels;
    }

    public String getCustomerSegments() {
        return customerSegments;
    }

    public String getCostStructure() {
        return costStructure;
    }

    public String getRevenueStreams() {
        return revenueStreams;
    }
}
