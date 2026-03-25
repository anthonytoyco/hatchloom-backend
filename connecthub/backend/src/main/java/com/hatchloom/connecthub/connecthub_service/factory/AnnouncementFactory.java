package com.hatchloom.connecthub.connecthub_service.factory;

import com.hatchloom.connecthub.connecthub_service.model.AnnouncementPost;
import com.hatchloom.connecthub.connecthub_service.model.Post;
import org.springframework.stereotype.Component;

import java.util.UUID;

/**
 * Factory for creating announcementPost objects
 */
@Component("announcementFactory")
public class AnnouncementFactory extends PostFactory {
    @Override
    public Post createPost(String title, String content, UUID authorId) {
        return new AnnouncementPost(title, content, authorId);
    }
}
