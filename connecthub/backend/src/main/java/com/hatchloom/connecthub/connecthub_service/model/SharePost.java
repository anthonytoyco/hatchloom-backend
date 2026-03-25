package com.hatchloom.connecthub.connecthub_service.model;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

/**
 * Entity representing a share post, a specific type of post
 * that can be created by users to share content
 */
@Entity
@DiscriminatorValue("share")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
public class SharePost extends Post {

    @Column(name = "post_type", nullable = false, insertable = false, updatable = false)
    private final String postType = "share";

    public SharePost(String title, String content, UUID author) {
        super();
        this.setTitle(title);
        this.setContent(content);
        this.setAuthor(author);
    }

    @Override
    public String getPostType() {
        return postType;
        }
}

