package com.hatchloom.connecthub.connecthub_service.enums;

import lombok.Getter;

@Getter
public enum ActionType {
    LIKE("like"),
    COMMENT("comment");

    private final String value;

    ActionType(String value) {
        this.value = value;
    }
}

