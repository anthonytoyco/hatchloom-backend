package com.hatchloom.connecthub.connecthub_service.observer;

import com.hatchloom.connecthub.connecthub_service.model.ClassifiedPost;

import java.util.UUID;

/**
 * Observer interface for receiving updates about classified posts
 */
public interface ClassifiedObserver {
    void update(ClassifiedPost post, UUID receiverUserId);
}
