package com.hatchloom.connecthub.connecthub_service.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

/**
 * DTO for handling post creation requests,
 * using base post fields and a post type
 * @param basePost
 * @param postType
 */
public record PostCreationRequest(
        @Valid @NotNull BasePostRequest basePost,
        @NotNull(message = "Post type must not be null")
        @Pattern(regexp = "^(share|announcement|achievement)$", message = "Post type must be 'share', 'announcement', or 'achievement'")
        String postType
) {
}