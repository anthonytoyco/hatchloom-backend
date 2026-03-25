package com.hatchloom.connecthub.connecthub_service.utils;

public record PostCursorPayload(String createdAt, Integer id) implements CursorPayload {
}
