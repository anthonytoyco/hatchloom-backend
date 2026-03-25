package com.hatchloom.connecthub.connecthub_service.observer;

import com.hatchloom.connecthub.connecthub_service.model.Messages;

import java.util.UUID;

/**
 * Observer interface for receiving updates about new messages
 */
public interface MessageObserver {
    void update(Messages message, UUID receiverUserId);
}
