package com.hatchloom.connecthub.connecthub_service.model;

import jakarta.persistence.Column;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * Entity representing an announcement post,
 * a specific type of post that can be created by users to share an announcement.
 */
@Entity
@DiscriminatorValue("announcement")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
public class AnnouncementPost extends Post {
    @Column(name = "post_type", nullable = false, insertable = false, updatable = false)
    private final String postType = "announcement";

    public AnnouncementPost(String title, String content, UUID author) {
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
