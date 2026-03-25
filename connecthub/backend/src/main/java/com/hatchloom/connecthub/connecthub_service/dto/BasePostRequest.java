package com.hatchloom.connecthub.connecthub_service.dto;

import jakarta.validation.constraints.NotBlank;
/**
 * Base DTO for handling common fields for post types
 * @param title
 * @param content
 */
public record BasePostRequest(
        @NotBlank(message = "Title must not be blank") String title,
        @NotBlank(message = "Content must not be blank") String content
) {
}

