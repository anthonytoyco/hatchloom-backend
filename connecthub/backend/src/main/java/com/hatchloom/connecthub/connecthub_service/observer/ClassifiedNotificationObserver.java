package com.hatchloom.connecthub.connecthub_service.observer;

import com.hatchloom.connecthub.connecthub_service.builder.NotificationBuilder;
import com.hatchloom.connecthub.connecthub_service.enums.NotificationType;
import com.hatchloom.connecthub.connecthub_service.model.ClassifiedPost;
import com.hatchloom.connecthub.connecthub_service.service.NotificationService;
import org.springframework.stereotype.Component;

import java.util.UUID;

/**
 * Observer implementation that listens for updates to classified posts and creates notifications
 * for users when a new classified post is created
 */
@Component
public class ClassifiedNotificationObserver implements ClassifiedObserver {
    private final NotificationService notificationService;

    public ClassifiedNotificationObserver(NotificationService notificationService) {
        this.notificationService = notificationService;
    }


    /**
     * Method is called when a classified post is created, creating
     * a notification for those who are subscribed
     * @param post the classified post that was created
     * @param receiverUserId the user ID of the notification recipient
     */
    @Override
    public void update(ClassifiedPost post, UUID receiverUserId) {
        String shortenedTitle = post.getTitle().substring(0, Math.min(20, post.getTitle().length()));
        notificationService.createNotification(
                new NotificationBuilder()
                .setRecipientUserId(receiverUserId)
                .setSenderUserId(post.getAuthor())
                .setType(NotificationType.CLASSIFIED_CREATED)
                .setMessage("New classified post: " + shortenedTitle)
                .setClassifiedPostId(post.getId()));
    }
}
