package com.hatchloom.launchpad.service;

import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.hatchloom.launchpad.dto.response.BMCResponse;
import com.hatchloom.launchpad.model.BusinessModelCanvas;
import com.hatchloom.launchpad.model.SideHustle;
import com.hatchloom.launchpad.model.enums.BMCSectionKey;
import com.hatchloom.launchpad.repository.BusinessModelCanvasRepository;

/**
 * Service for Business Model Canvas operations.
 *
 * <p>
 * Each BMC section is edited independently. Unknown section keys are rejected
 * with 400 Bad Request. Ownership of the parent SideHustle is validated before
 * any write operation.
 * </p>
 */
@Service
public class BMCService {

    private final BusinessModelCanvasRepository bmcRepository;
    private final SideHustleService sideHustleService;

    public BMCService(BusinessModelCanvasRepository bmcRepository,
            SideHustleService sideHustleService) {
        this.bmcRepository = bmcRepository;
        this.sideHustleService = sideHustleService;
    }

    /**
     * Returns the full BMC for the given SideHustle.
     *
     * @param sideHustleId the SideHustle UUID
     * @return the {@link BMCResponse}
     */
    @Transactional(readOnly = true)
    public BMCResponse getBMC(UUID sideHustleId) {
        return BMCResponse.from(findBMCOrThrow(sideHustleId));
    }

    /**
     * Updates a single BMC section. Validates ownership and section key.
     *
     * @param sideHustleId     the SideHustle UUID
     * @param sectionKeyString the BMC section key (e.g.
     *                         {@code "value_propositions"})
     * @param content          the new content for that section
     * @param callerId         the authenticated student's UUID
     * @return the updated {@link BMCResponse}
     */
    @Transactional
    public BMCResponse editSection(UUID sideHustleId, String sectionKeyString,
            String content, UUID callerId) {
        SideHustle sideHustle = sideHustleService.findOrThrow(sideHustleId);
        validateOwnership(sideHustle, callerId);

        BMCSectionKey key = parseSectionKey(sectionKeyString);
        BusinessModelCanvas bmc = findBMCOrThrow(sideHustleId);
        applySection(bmc, key, content);
        return BMCResponse.from(bmcRepository.save(bmc));
    }

    private void validateOwnership(SideHustle sideHustle, UUID callerId) {
        if (!sideHustle.getStudentId().equals(callerId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "You do not own this SideHustle");
        }
    }

    private BMCSectionKey parseSectionKey(String raw) {
        try {
            return BMCSectionKey.valueOf(raw.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Unknown BMC section key: " + raw);
        }
    }

    private void applySection(BusinessModelCanvas bmc, BMCSectionKey key, String content) {
        switch (key) {
            case KEY_PARTNERS -> bmc.setKeyPartners(content);
            case KEY_ACTIVITIES -> bmc.setKeyActivities(content);
            case KEY_RESOURCES -> bmc.setKeyResources(content);
            case VALUE_PROPOSITIONS -> bmc.setValuePropositions(content);
            case CUSTOMER_RELATIONSHIPS -> bmc.setCustomerRelationships(content);
            case CHANNELS -> bmc.setChannels(content);
            case CUSTOMER_SEGMENTS -> bmc.setCustomerSegments(content);
            case COST_STRUCTURE -> bmc.setCostStructure(content);
            case REVENUE_STREAMS -> bmc.setRevenueStreams(content);
        }
    }

    private BusinessModelCanvas findBMCOrThrow(UUID sideHustleId) {
        return bmcRepository.findBySideHustle_Id(sideHustleId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "BMC not found for SideHustle: " + sideHustleId));
    }
}
