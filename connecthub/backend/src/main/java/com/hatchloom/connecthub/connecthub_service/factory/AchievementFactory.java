package com.hatchloom.connecthub.connecthub_service.factory;

import com.hatchloom.connecthub.connecthub_service.model.AchievementPost;
import com.hatchloom.connecthub.connecthub_service.model.Post;
import org.springframework.stereotype.Component;

import java.util.UUID;

/**
 * Factory for creating AchievementPost objects
 */
@Component("achievementFactory")
public class AchievementFactory extends PostFactory {
    @Override
    public Post createPost(String title, String content, UUID authorId) {
        return new AchievementPost(title, content, authorId);
    }
}
