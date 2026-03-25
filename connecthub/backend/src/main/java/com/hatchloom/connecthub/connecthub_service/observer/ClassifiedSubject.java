package com.hatchloom.connecthub.connecthub_service.observer;

import com.hatchloom.connecthub.connecthub_service.model.ClassifiedPost;

import java.util.UUID;

/**
 * Subject interface for managing classified post subscriptions and notifications
 */
public interface ClassifiedSubject {
    void subscribe(UUID userId);
    void unsubscribe(UUID userId);
    void notifyObservers(ClassifiedPost post, UUID receiverUserId);
}
