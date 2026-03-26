package com.hatchloom.connecthub.connecthub_service.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

import java.util.UUID;

/**
 * DTO for handling classified post creation requests,
 * using base post fields
 * @param basePost
 * @param projectId
 * @param status
 */
public record ClassifiedPostCreationRequest(
        @Valid @NotNull BasePostRequest basePost,
        @NotNull(message = "Project ID must not be null") UUID projectId,
        UUID positionId,
        @Pattern(regexp = "^(open|filled|closed)$", message = "Status must be 'open', 'filled', or 'closed'")
        String status
) {
}



