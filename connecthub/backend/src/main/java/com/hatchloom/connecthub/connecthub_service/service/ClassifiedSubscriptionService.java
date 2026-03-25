package com.hatchloom.connecthub.connecthub_service.service;

import com.hatchloom.connecthub.connecthub_service.model.ClassifiedSubscription;
import com.hatchloom.connecthub.connecthub_service.repository.ClassifiedSubscriptionRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.UUID;

/**
 * Service class for managing classified subscriptions
 */
@Service
public class ClassifiedSubscriptionService {
    private final ClassifiedSubscriptionRepository subscriptionRepository;

    public ClassifiedSubscriptionService(ClassifiedSubscriptionRepository subscriptionRepository) {
        this.subscriptionRepository = subscriptionRepository;
    }

    /**
     * Subscribes a user to classified post notifications
     * @param userId The user ID to subscribe
     */
    public void subscribe(UUID userId) {
        if (userId == null) {
            throw new IllegalArgumentException("User ID cannot be null");
        }

        if (!subscriptionRepository.existsByUserId(userId)) {
            ClassifiedSubscription subscription = new ClassifiedSubscription();
            subscription.setUserId(userId);
            subscriptionRepository.save(subscription);
        }
    }

    /**
     * Unsubscribes a user from classified post notifications
     * @param userId The user ID who wants to unsubscribe
     */
    @Transactional
    public void unsubscribe(UUID userId) {
        if (userId == null) {
            throw new IllegalArgumentException("User ID cannot be null");
        }

        subscriptionRepository.deleteByUserId(userId);
    }

    /**
     * Retrieves a list of all user IDs subscribed to classified post notifications
     * @return list of user IDs subscribed
     */
    public List<UUID> getAllSubscribers() {
        return subscriptionRepository.findAllUserIds();
    }
}
