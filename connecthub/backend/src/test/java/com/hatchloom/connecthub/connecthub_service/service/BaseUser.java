package com.hatchloom.connecthub.connecthub_service.service;

import java.util.UUID;

public class BaseUser {
    protected UUID id;
    protected String name;
    protected String email;

    public BaseUser(UUID id, String name, String email) {
        this.id = id;
        this.name = name;
        this.email = email;
    }
}
