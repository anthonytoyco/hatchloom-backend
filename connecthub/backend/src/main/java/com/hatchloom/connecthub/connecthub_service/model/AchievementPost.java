package com.hatchloom.connecthub.connecthub_service.model;

import jakarta.persistence.Column;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * Entity representing an achievement post, a
 * specific type of post that can be created by users to share an achievement.
 */
@Entity
@DiscriminatorValue("achievement")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
public class AchievementPost extends Post {

    @Column(name = "post_type", nullable = false, insertable = false, updatable = false)
    private final String postType = "achievement";

    public AchievementPost(String title, String content, UUID author) {
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
