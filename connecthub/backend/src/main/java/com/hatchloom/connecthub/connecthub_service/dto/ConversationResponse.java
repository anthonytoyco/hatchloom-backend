package com.hatchloom.connecthub.connecthub_service.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public record ConversationResponse(
    UUID id,
    UUID otherUserId,
    LocalDateTime createdAt)  {

}
