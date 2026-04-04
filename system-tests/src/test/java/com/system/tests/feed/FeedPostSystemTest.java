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

    @Test
    @DisplayName("Test creating a feed post with invalid type")
    void testCreateFeedPostInvalidType() throws Exception {
        HttpResponse<String> response = post(CONNECTHUB_URL, "/api/feed", Map.of(
                "basePost", Map.of("title", "System Test Post", "content", "This is a system test"),
                "postType", "invalid"
        ));
        Assertions.assertEquals(400, response.statusCode());
    }

    @Test
    @DisplayName("Test deleting a post")
    void testDeleteFeedPost() throws Exception {
        HttpResponse<String> response = post(CONNECTHUB_URL,"/api/feed", Map.of(
                "basePost", Map.of(
                        "title", "System Test Post",
                        "content", "This is a system test"
                ),
                "postType", "share"
        ));

        Assertions.assertEquals(201, response.statusCode());
        int postId = objectMapper.readTree(response.body()).get("id").asInt();


        HttpResponse<String> deleteResponse = delete(CONNECTHUB_URL, "/api/feed/" + postId);
        Assertions.assertEquals(200, deleteResponse.statusCode());
    }

    @Test
    @DisplayName("Test deleting a non-existent post")
    void testDeleteNonExistentFeedPost() throws Exception {
        HttpResponse<String> deleteResponse = delete(CONNECTHUB_URL, "/api/feed/999999");
        Assertions.assertEquals(400, deleteResponse.statusCode());
    }

    @Test
    @DisplayName("Test getting posts")
    void testGetFeedPosts() throws Exception {
        HttpResponse<String> response = post(CONNECTHUB_URL,"/api/feed", Map.of(
                "basePost", Map.of(
                        "title", "System Test Post",
                        "content", "This is a system test"
                ),
                "postType", "share"
        ));

        Assertions.assertEquals(201, response.statusCode());

        HttpResponse<String> response2 = post(CONNECTHUB_URL,"/api/feed", Map.of(
                "basePost", Map.of(
                        "title", "System Post 2",
                        "content", "This is a second test"
                ),
                "postType", "announcement"
        ));

        Assertions.assertEquals(201, response.statusCode());

        HttpResponse<String> getResponse = get(CONNECTHUB_URL, "/api/feed");
        Assertions.assertEquals(200, getResponse.statusCode());

        var posts = objectMapper.readTree(getResponse.body()).get("data");
        Assertions.assertTrue(posts.isArray());
        Assertions.assertTrue(posts.size() >= 2);

    }
}
