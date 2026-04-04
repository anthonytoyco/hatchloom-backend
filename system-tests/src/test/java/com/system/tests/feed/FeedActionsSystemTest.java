package com.system.tests.feed;

import java.net.http.HttpResponse;
import java.util.Map;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import com.system.tests.base.BaseSystemTest;

public class FeedActionsSystemTest extends BaseSystemTest {
    private int createPost() throws Exception {
        HttpResponse<String> response = post(CONNECTHUB_URL, "/api/feed", Map.of(
                "basePost", Map.of(
                        "title", "System Test Post",
                        "content", "This is a system test"),
                "postType", "share"));

        Assertions.assertEquals(201, response.statusCode());
        return objectMapper.readTree(response.body()).get("id").asInt();
    }

    private void deletePost(int postId) throws Exception {
        HttpResponse<String> deleteResponse = delete(CONNECTHUB_URL, "/api/feed/" + postId);
        Assertions.assertEquals(200, deleteResponse.statusCode());
    }

    @Test
    @DisplayName("Test liking a feed post")
    void testLikingFeedPost() throws Exception {
        int postId = createPost();
        HttpResponse<String> response = post(CONNECTHUB_URL, "/api/feed/actions/like", Map.of("postId", postId));
        Assertions.assertEquals(201, response.statusCode());
        Assertions.assertEquals("Post liked successfully", response.body());
        deletePost(postId);
    }

    @Test
    @DisplayName("Test unliking a post")
    void testUnlikingFeedPost() throws Exception {
        int postId = createPost();
        HttpResponse<String> response = post(CONNECTHUB_URL, "/api/feed/actions/like", Map.of("postId", postId));
        Assertions.assertEquals(201, response.statusCode());

        HttpResponse<String> deleteResponse = delete(CONNECTHUB_URL, "/api/feed/actions/like?postId=" + postId);
        Assertions.assertEquals(200, deleteResponse.statusCode());

        Assertions.assertEquals("Post unliked successfully", deleteResponse.body());
        deletePost(postId);
    }

    @Test
    @DisplayName("Test creating a comment")
    void testCreateComment() throws Exception {
        int postId = createPost();
        HttpResponse<String> response = post(CONNECTHUB_URL, "/api/feed/actions/comment", Map.of(
                "postId", postId,
                "commentText", "This is a test comment"));

        Assertions.assertEquals(201, response.statusCode());
        deletePost(postId);
    }

    @Test
    @DisplayName("Test deleting a comment")
    void testDeleteComment() throws Exception {
        int postId = createPost();
        HttpResponse<String> response = post(CONNECTHUB_URL, "/api/feed/actions/comment", Map.of(
                "postId", postId,
                "commentText", "This is a test comment"));

        Assertions.assertEquals(201, response.statusCode());
        int commentId = objectMapper.readTree(response.body()).get("id").asInt();

        HttpResponse<String> deleteResponse = delete(CONNECTHUB_URL, "/api/feed/actions/comment/" + commentId);
        Assertions.assertEquals(200, deleteResponse.statusCode());
        deletePost(postId);
    }

    @Test
    @DisplayName("Test creating an empty comment")
    void testCreateEmptyComment() throws Exception {
        int postId = createPost();
        HttpResponse<String> response = post(CONNECTHUB_URL, "/api/feed/actions/comment", Map.of(
                "postId", postId,
                "commentText", ""));

        Assertions.assertEquals(400, response.statusCode());
        deletePost(postId);
    }

    @Test
    @DisplayName("Test getting post actions")
    void testGetPostActions() throws Exception {
        int postId = createPost();
        HttpResponse<String> commentResponse = post(CONNECTHUB_URL, "/api/feed/actions/comment", Map.of(
                "postId", postId,
                "commentText", "This is a test comment"));

        Assertions.assertEquals(201, commentResponse.statusCode());

        HttpResponse<String> likeResponse = post(CONNECTHUB_URL, "/api/feed/actions/like", Map.of("postId", postId));
        Assertions.assertEquals(201, likeResponse.statusCode());
        Assertions.assertEquals("Post liked successfully", likeResponse.body());

        HttpResponse<String> response = get(CONNECTHUB_URL, "/api/feed/actions/post/" + postId);
        Assertions.assertEquals(200, response.statusCode());

        var jsonResponse = objectMapper.readTree(response.body());
        Assertions.assertEquals(1, jsonResponse.get("likesCount").asLong());
        Assertions.assertEquals(1, jsonResponse.get("commentsCount").asLong());
        Assertions.assertTrue(jsonResponse.get("isLikedByCurrentUser").asBoolean());
        deletePost(postId);
    }

}
