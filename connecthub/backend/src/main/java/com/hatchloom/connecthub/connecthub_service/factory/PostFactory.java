package com.hatchloom.connecthub.connecthub_service.factory;

import com.hatchloom.connecthub.connecthub_service.model.Post;

import java.util.UUID;

/**
 * Abstract class for PostFactory,
 * defining the method createPost that will be implemented by the concrete factories
 */
public abstract class PostFactory {
    abstract Post createPost(String title, String content, UUID authorId);
}

