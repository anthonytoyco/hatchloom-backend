package com.hatchloom.connecthub.connecthub_service.factory;

import com.hatchloom.connecthub.connecthub_service.model.Post;
import com.hatchloom.connecthub.connecthub_service.model.SharePost;
import org.springframework.stereotype.Component;

import java.util.UUID;

/**
 * Factory for creating SharePost objects
 */
@Component("shareFactory")
public class ShareFactory extends PostFactory {
    @Override
    public Post createPost(String title, String content, UUID authorId) {
        return new SharePost(title, content, authorId);
    }

}
