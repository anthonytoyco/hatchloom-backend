package com.hatchloom.connecthub.connecthub_service.dto;

import java.util.UUID;

/**
 * DTO for handling send message requests
 * @param conversationId
 * @param content
 */
public record SendMessageRequest(UUID conversationId, String content) {

}
