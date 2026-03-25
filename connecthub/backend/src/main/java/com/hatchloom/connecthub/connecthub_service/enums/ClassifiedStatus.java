package com.hatchloom.connecthub.connecthub_service.enums;

import lombok.Getter;

@Getter
public enum ClassifiedStatus {
    OPEN("open"),
    CLOSED("closed"),
    PENDING("pending");

    private final String status;

    ClassifiedStatus(String status) {
        this.status = status;
    }
}