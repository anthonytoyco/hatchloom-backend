package com.hatchloom.connecthub.connecthub_service.observer;
import com.hatchloom.connecthub.connecthub_service.model.ClassifiedPost;
import com.hatchloom.connecthub.connecthub_service.service.ClassifiedSubscriptionService;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Component;
import java.util.List;
import java.util.UUID;


/**
 * Subject implementation for managing classified post subscriptions and notifications
 */
@Component
public class ClassifiedPostFeed implements ClassifiedSubject {
    private final ClassifiedSubscriptionService subscriptionService;
    private final ClassifiedObserver observer;

    public ClassifiedPostFeed(ClassifiedSubscriptionService subscriptionService, ClassifiedObserver observer) {
        this.subscriptionService = subscriptionService;
        this.observer = observer;
    }

    /**
     * Subscribe a user to receive notifications about new classified posts
     * @param userId the ID of the user subscribing to notifications
     */
    @Override
    public void subscribe(UUID userId) {
        subscriptionService.subscribe(userId);
    }

    /**
     * Unsubscribe a user from receiving notifications about new classified posts
     * @param userId the ID of the user unsubscribing from notifications
     */
    @Override
    public void unsubscribe(UUID userId) {
        subscriptionService.unsubscribe(userId);
    }

    /**
     * Notify all subscribed users about a new classified post, excluding the creator of the post
     * @param post the created classified post
     * @param creatorUserId the ID of the user who created the classified post
     */
    @Override
    public void notifyObservers(ClassifiedPost post, UUID creatorUserId) {
        List<UUID> subscribers = subscriptionService.getAllSubscribers();

        for (UUID userId : subscribers) {
            if (!userId.equals(creatorUserId)) {
                observer.update(post, userId);
            }
        }
    }
}
