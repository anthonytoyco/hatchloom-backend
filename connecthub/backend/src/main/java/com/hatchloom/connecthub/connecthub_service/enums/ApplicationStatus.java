package com.hatchloom.connecthub.connecthub_service.enums;

import lombok.Getter;

@Getter
public enum ApplicationStatus {
    APPLIED("applied"),
    ACCEPTED("accepted"),
    REJECTED("rejected");

    private final String status;

    ApplicationStatus(String status) {
        this.status = status;
    }
}
