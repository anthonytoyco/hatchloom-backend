package com.system.tests.feed;

import com.system.tests.base.BaseSystemTest;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.net.http.HttpResponse;
import java.util.Map;

public class FeedPostSystemTest extends BaseSystemTest {
    @Test
    @DisplayName("Test creating a feed post")
    void testCreateFeedPost() throws Exception {
        HttpResponse<String> response = post(CONNECTHUB_URL,"/api/feed", Map.of(
                "basePost", Map.of(
                        "title", "System Test Post",
                        "content", "This is a system test"
                ),
                "postType", "share"
        ));

        Assertions.assertEquals(201, response.statusCode());
    }

    @Test
    @DisplayName("Test creating a feed post with missing title")
    void testCreateFeedPostMissingTitle() throws Exception {
        HttpResponse<String> response = post(CONNECTHUB_URL, "/api/feed", Map.of(
                "basePost", Map.of(
                        "content", "This is a system test"
                ),
                "postType", "share"
        ));
        Assertions.assertEquals(400, response.statusCode());
    }

    @Test
    @DisplayName("Test creating a feed post with missing content")
    void testCreateFeedPostMissingContent() throws Exception {
        HttpResponse<String> response = post(CONNECTHUB_URL, "/api/feed", Map.of(
                "basePost", Map.of(
                        "title", "System Test Post"
                ),
                "postType", "share"
        ));
        Assertions.assertEquals(400, response.statusCode());
    }
    @Test
    @DisplayName("Test creating a feed post with missing type")
    void testCreateFeedPostMissingType() throws Exception {
        HttpResponse<String> response = post(CONNECTHUB_URL, "/api/feed", Map.of(
                "basePost", Map.of("title", "System Test Post", "content", "This is a system test")
        ));
        Assertions.assertEquals(400, response.statusCode());
    }
}
