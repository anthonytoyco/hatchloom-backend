package com.hatchloom.connecthub.connecthub_service.utils;

import com.hatchloom.connecthub.connecthub_service.dto.ClassifiedPostCreationRequest;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
public class ClassifiedPostValidators {

    /**
     * Validates the classified post creation request
     * @param request the incoming request
     */
    public void validateClassifiedRequest(ClassifiedPostCreationRequest request, UUID authorId) {
        if (request == null) {
            throw new IllegalArgumentException("Request must not be null");
        }

        if (request.basePost().title() == null || request.basePost().title().trim().isEmpty()) {
            throw new IllegalArgumentException("Title must not be null or empty");
        }
        if (request.basePost().content() == null || request.basePost().content().trim().isEmpty()) {
            throw new IllegalArgumentException("Content must not be null or empty");
        }

        if (authorId == null) {
            throw new IllegalArgumentException("Author ID must not be null");
        }

        if (request.projectId() == null) {
            throw new IllegalArgumentException("Project ID must not be null");
        }

        if (request.basePost().title().length() > 255) {
            throw new IllegalArgumentException("Title must not exceed 255 characters");
        }
        if (request.basePost().content().length() > 3000) {
            throw new IllegalArgumentException("Content must not exceed 3000 characters");
        }

        if (validateStatus(request.status())) {
            throw new IllegalArgumentException("Status must be 'open', 'filled', or 'closed'");
        }
    }

    /**
     * Validates the post ID and user ID parameters
     * @param postId the post ID to validate
     * @param userId the user ID to validate
     */
    public void validatePostParams(Integer postId, UUID userId) {
        if (postId == null) {
            throw new IllegalArgumentException("Post ID must not be null");
        }

        if (userId == null) {
            throw new IllegalArgumentException("User ID must not be null");
        }

    }

    /**
     * Validates the status input to ensure it is either "open", "filled", or "closed"
     * @param status the status string to validate
     * @return a boolean whether the status is valid or not
     */
    public boolean validateStatus(String status) {
        return status == null || (!status.equals("open") && !status.equals("filled") && !status.equals("closed"));
    }

}
