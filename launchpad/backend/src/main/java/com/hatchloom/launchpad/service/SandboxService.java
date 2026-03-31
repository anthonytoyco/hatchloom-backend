package com.hatchloom.launchpad.service;

import java.util.List;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.hatchloom.launchpad.dto.request.CreateSandboxRequest;
import com.hatchloom.launchpad.dto.request.UpdateSandboxRequest;
import com.hatchloom.launchpad.dto.response.SandboxResponse;
import com.hatchloom.launchpad.model.Sandbox;
import com.hatchloom.launchpad.repository.SandboxRepository;
import com.hatchloom.launchpad.repository.SideHustleRepository;

/**
 * Service for Sandbox CRUD operations.
 */
@Service
public class SandboxService {

    private static final Logger log = LoggerFactory.getLogger(SandboxService.class);

    private final SandboxRepository sandboxRepository;
    private final SideHustleRepository sideHustleRepository;

    public SandboxService(SandboxRepository sandboxRepository,
            SideHustleRepository sideHustleRepository) {
        this.sandboxRepository = sandboxRepository;
        this.sideHustleRepository = sideHustleRepository;
    }

    /**
     * Creates a new Sandbox and returns the saved response.
     *
     * @param request the creation request
     * @return the created {@link SandboxResponse}
     */
    @Transactional
    public SandboxResponse createSandbox(CreateSandboxRequest request) {
        Sandbox sandbox = new Sandbox();
        sandbox.setStudentId(request.getStudentId());
        sandbox.setTitle(request.getTitle());
        sandbox.setDescription(request.getDescription());
        Sandbox saved = sandboxRepository.save(sandbox);
        log.debug("Created sandbox {} for student {}", saved.getId(), saved.getStudentId());
        return SandboxResponse.from(saved);
    }

    /**
     * Returns a Sandbox by ID, or throws 404 if not found.
     *
     * @param sandboxId the sandbox UUID
     * @return the {@link SandboxResponse}
     */
    @Transactional(readOnly = true)
    public SandboxResponse getSandbox(UUID sandboxId) {
        return SandboxResponse.from(findOrThrow(sandboxId));
    }

    /**
     * Updates a Sandbox's title and description.
     *
     * @param sandboxId the sandbox UUID
     * @param request   the update request
     * @return the updated {@link SandboxResponse}
     */
    @Transactional
    public SandboxResponse updateSandbox(UUID sandboxId, UpdateSandboxRequest request) {
        Sandbox sandbox = findOrThrow(sandboxId);
        sandbox.setTitle(request.getTitle());
        sandbox.setDescription(request.getDescription());
        return SandboxResponse.from(sandboxRepository.save(sandbox));
    }

    /**
     * Deletes a Sandbox. Any SideHustles linked to it will retain their data
     * with sandbox_id set to NULL, allowing them to remain independent.
     *
     * <p>
     * Only the Sandbox and its direct children (SandboxTools) are deleted
     * due to cascade rules.
     * </p>
     *
     * @param sandboxId the sandbox UUID
     */
    @Transactional
    public void deleteSandbox(UUID sandboxId) {
        Sandbox sandbox = findOrThrow(sandboxId);
        sandboxRepository.delete(sandbox);
        log.debug("Deleted sandbox {}. Any linked side hustles remain with null sandbox_id", sandboxId);
    }

    /**
     * Returns all sandboxes belonging to a student.
     *
     * @param studentId the student's UUID
     * @return list of {@link SandboxResponse}
     */
    @Transactional(readOnly = true)
    public List<SandboxResponse> listByStudent(UUID studentId) {
        return sandboxRepository.findAllByStudentId(studentId)
                .stream()
                .map(SandboxResponse::from)
                .toList();
    }

    /**
     * Returns the raw {@link Sandbox} entity or throws 404. Used by other services.
     *
     * @param sandboxId the sandbox UUID
     * @return the {@link Sandbox} entity
     */
    public Sandbox findOrThrow(UUID sandboxId) {
        return sandboxRepository.findById(sandboxId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Sandbox not found: " + sandboxId));
    }
}
