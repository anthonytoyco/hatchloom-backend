package com.hatchloom.launchpad.model;

import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

/**
 * Business Model Canvas associated one-to-one with a {@link SideHustle}.
 *
 * <p>
 * All nine BMC sections are stored as nullable {@code TEXT} fields - a section
 * is empty until the student fills it in via a PATCH request. This record is
 * auto-created (with all sections null) when its parent SideHustle is created.
 * </p>
 *
 * <p>
 * The table is named {@code bmc_sections} to match the design doc data store
 * specification; without {@code @Table} Hibernate would look for
 * {@code business_model_canvases}.
 * </p>
 */
@Entity
@Table(name = "bmc_sections")
public class BusinessModelCanvas {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne
    @JoinColumn(name = "side_hustle_id", nullable = false)
    private SideHustle sideHustle;

    @Column(name = "key_partners", columnDefinition = "TEXT")
    private String keyPartners;

    @Column(name = "key_activities", columnDefinition = "TEXT")
    private String keyActivities;

    @Column(name = "key_resources", columnDefinition = "TEXT")
    private String keyResources;

    @Column(name = "value_propositions", columnDefinition = "TEXT")
    private String valuePropositions;

    @Column(name = "customer_relationships", columnDefinition = "TEXT")
    private String customerRelationships;

    @Column(name = "channels", columnDefinition = "TEXT")
    private String channels;

    @Column(name = "customer_segments", columnDefinition = "TEXT")
    private String customerSegments;

    @Column(name = "cost_structure", columnDefinition = "TEXT")
    private String costStructure;

    @Column(name = "revenue_streams", columnDefinition = "TEXT")
    private String revenueStreams;

    /** Default constructor required by JPA. */
    public BusinessModelCanvas() {
    }

    public UUID getId() {
        return id;
    }

    public SideHustle getSideHustle() {
        return sideHustle;
    }

    public void setSideHustle(SideHustle sideHustle) {
        this.sideHustle = sideHustle;
    }

    public String getKeyPartners() {
        return keyPartners;
    }

    public void setKeyPartners(String keyPartners) {
        this.keyPartners = keyPartners;
    }

    public String getKeyActivities() {
        return keyActivities;
    }

    public void setKeyActivities(String keyActivities) {
        this.keyActivities = keyActivities;
    }

    public String getKeyResources() {
        return keyResources;
    }

    public void setKeyResources(String keyResources) {
        this.keyResources = keyResources;
    }

    public String getValuePropositions() {
        return valuePropositions;
    }

    public void setValuePropositions(String valuePropositions) {
        this.valuePropositions = valuePropositions;
    }

    public String getCustomerRelationships() {
        return customerRelationships;
    }

    public void setCustomerRelationships(String customerRelationships) {
        this.customerRelationships = customerRelationships;
    }

    public String getChannels() {
        return channels;
    }

    public void setChannels(String channels) {
        this.channels = channels;
    }

    public String getCustomerSegments() {
        return customerSegments;
    }

    public void setCustomerSegments(String customerSegments) {
        this.customerSegments = customerSegments;
    }

    public String getCostStructure() {
        return costStructure;
    }

    public void setCostStructure(String costStructure) {
        this.costStructure = costStructure;
    }

    public String getRevenueStreams() {
        return revenueStreams;
    }

    public void setRevenueStreams(String revenueStreams) {
        this.revenueStreams = revenueStreams;
    }
}
