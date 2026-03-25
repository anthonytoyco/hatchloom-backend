package com.hatchloom.launchpad.service;

import java.util.List;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.hatchloom.launchpad.dto.request.CreateSideHustleRequest;
import com.hatchloom.launchpad.dto.request.UpdateSideHustleRequest;
import com.hatchloom.launchpad.dto.response.SideHustleResponse;
import com.hatchloom.launchpad.factory.SideHustleFactoryProvider;
import com.hatchloom.launchpad.model.BusinessModelCanvas;
import com.hatchloom.launchpad.model.Sandbox;
import com.hatchloom.launchpad.model.SideHustle;
import com.hatchloom.launchpad.model.Team;
import com.hatchloom.launchpad.repository.BusinessModelCanvasRepository;
import com.hatchloom.launchpad.repository.SideHustleRepository;
import com.hatchloom.launchpad.repository.TeamRepository;

/**
 * Service for SideHustle CRUD operations.
 *
 * <p>
 * Uses the Factory Method pattern (via {@link SideHustleFactoryProvider}) to
 * instantiate the correct SideHustle subtype. Auto-creates an empty
 * {@link BusinessModelCanvas} and {@link Team} on every SideHustle creation.
 * </p>
 */
@Service
public class SideHustleService {

    private static final Logger log = LoggerFactory.getLogger(SideHustleService.class);

    private final SideHustleRepository sideHustleRepository;
    private final BusinessModelCanvasRepository bmcRepository;
    private final TeamRepository teamRepository;
    private final SideHustleFactoryProvider factoryProvider;
    private final SandboxService sandboxService;

    public SideHustleService(SideHustleRepository sideHustleRepository,
            BusinessModelCanvasRepository bmcRepository,
            TeamRepository teamRepository,
            SideHustleFactoryProvider factoryProvider,
            SandboxService sandboxService) {
        this.sideHustleRepository = sideHustleRepository;
        this.bmcRepository = bmcRepository;
        this.teamRepository = teamRepository;
        this.factoryProvider = factoryProvider;
        this.sandboxService = sandboxService;
    }

    /**
     * Creates a new SideHustle using the Factory Method pattern.
     * Auto-creates an empty BMC and Team for the new SideHustle.
     *
     * @param request the creation request (must include a valid sandboxId)
     * @return the created {@link SideHustleResponse}
     */
    @Transactional
    public SideHustleResponse createSideHustle(CreateSideHustleRequest request) {
        if (request.getSandboxId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "sandboxId is required to create a SideHustle");
        }
        Sandbox sandbox = sandboxService.findOrThrow(request.getSandboxId());

        SideHustle sideHustle = factoryProvider
                .getFactory(request.getType())
                .createSideHustle(request.getTitle(), request.getDescription(),
                        request.getStudentId(), request.getSandboxId());
        sideHustle.setSandbox(sandbox);
        SideHustle saved = sideHustleRepository.save(sideHustle);

        // Auto-create empty BMC
        BusinessModelCanvas bmc = new BusinessModelCanvas();
        bmc.setSideHustle(saved);
        bmcRepository.save(bmc);

        // Auto-create empty Team
        Team team = new Team();
        team.setSideHustle(saved);
        teamRepository.save(team);

        log.debug("Created SideHustle {} (type={}) with BMC and Team", saved.getId(), saved.getStatus());
        return SideHustleResponse.from(saved);
    }

    /**
     * Returns a SideHustle by ID, or throws 404 if not found.
     *
     * @param sideHustleId the SideHustle UUID
     * @return the {@link SideHustleResponse}
     */
    @Transactional(readOnly = true)
    public SideHustleResponse getSideHustle(UUID sideHustleId) {
        return SideHustleResponse.from(findOrThrow(sideHustleId));
    }

    /**
     * Updates a SideHustle's title and description (metadata only).
     *
     * @param sideHustleId the SideHustle UUID
     * @param request      the update request
     * @return the updated {@link SideHustleResponse}
     */
    @Transactional
    public SideHustleResponse updateSideHustle(UUID sideHustleId, UpdateSideHustleRequest request) {
        SideHustle sideHustle = findOrThrow(sideHustleId);
        sideHustle.setTitle(request.getTitle());
        sideHustle.setDescription(request.getDescription());
        return SideHustleResponse.from(sideHustleRepository.save(sideHustle));
    }

    /**
     * Deletes a SideHustle. Cascades to BMC, Team, TeamMembers, and Positions.
     *
     * @param sideHustleId the SideHustle UUID
     */
    @Transactional
    public void deleteSideHustle(UUID sideHustleId) {
        SideHustle sideHustle = findOrThrow(sideHustleId);
        sideHustleRepository.delete(sideHustle);
        log.debug("Deleted SideHustle {}", sideHustleId);
    }

    /**
     * Returns all SideHustles owned by a student.
     *
     * @param studentId the student's UUID
     * @return list of {@link SideHustleResponse}
     */
    @Transactional(readOnly = true)
    public List<SideHustleResponse> listByStudent(UUID studentId) {
        return sideHustleRepository.findAllByStudentId(studentId)
                .stream()
                .map(SideHustleResponse::from)
                .toList();
    }

    /**
     * Returns the raw {@link SideHustle} entity or throws 404. Used by other
     * services.
     *
     * @param sideHustleId the SideHustle UUID
     * @return the {@link SideHustle} entity
     */
    public SideHustle findOrThrow(UUID sideHustleId) {
        return sideHustleRepository.findById(sideHustleId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "SideHustle not found: " + sideHustleId));
    }
}
