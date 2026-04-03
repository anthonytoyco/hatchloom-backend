package com.system.tests.feed;

import com.system.tests.base.BaseSystemTest;
import org.junit.jupiter.api.*;

import java.net.http.HttpResponse;
import java.util.Map;

public class FeedActionsSystemTest extends BaseSystemTest {
    private Integer postId;

    @BeforeEach
    void beforeEach() throws Exception {
        HttpResponse<String> response = post(CONNECTHUB_URL,"/api/feed", Map.of(
                "basePost", Map.of(
                        "title", "System Test Post",
                        "content", "This is a system test"
                ),
                "postType", "share"
        ));

        Assertions.assertEquals(201, response.statusCode());
        postId = objectMapper.readTree(response.body()).get("id").asInt();
    }

    @Test
    @DisplayName("Test liking a feed post")
    void testLikingFeedPost() throws Exception {
        HttpResponse<String> response = post(CONNECTHUB_URL,"/api/feed/actions/like", Map.of("postId", postId));
        Assertions.assertEquals(201, response.statusCode());
        Assertions.assertEquals("Post liked successfully", response.body());
    }

    @Test
    @DisplayName("Test unliking a post")
    void testUnlikingFeedPost() throws Exception {
        HttpResponse<String> response = post(CONNECTHUB_URL,"/api/feed/actions/like", Map.of("postId", postId));
        Assertions.assertEquals(201, response.statusCode());

        HttpResponse<String> deleteResponse = delete(CONNECTHUB_URL, "/api/feed/actions/like?postId=" + postId);
        Assertions.assertEquals(200, deleteResponse.statusCode());

        Assertions.assertEquals("Post unliked successfully", deleteResponse.body());
    }

    @Test
    @DisplayName("Test creating a comment")
    void testCreateComment() throws Exception {
        HttpResponse<String> response = post(CONNECTHUB_URL, "/api/feed/actions/comment", Map.of(
                "postId", postId,
                "commentText", "This is a test comment"
        ));

        Assertions.assertEquals(201, response.statusCode());
    }

    @Test
    @DisplayName("Test deleting a comment")
    void testDeleteComment() throws Exception {
        HttpResponse<String> response = post(CONNECTHUB_URL, "/api/feed/actions/comment", Map.of(
                "postId", postId,
                "commentText", "This is a test comment"
        ));

        Assertions.assertEquals(201, response.statusCode());
        int commentId = objectMapper.readTree(response.body()).get("id").asInt();

        HttpResponse<String> deleteResponse = delete(CONNECTHUB_URL, "/api/feed/actions/comment/" + commentId);
        Assertions.assertEquals(200, deleteResponse.statusCode());
    }

    @Test
    @DisplayName("Test creating an empty comment")
    void testCreateEmptyComment() throws Exception {
        HttpResponse<String> response = post(CONNECTHUB_URL, "/api/feed/actions/comment", Map.of(
                "postId", postId,
                "commentText", ""
        ));

        Assertions.assertEquals(400, response.statusCode());
    }

    @Test
    @DisplayName("Test getting post actions")
    void testGetPostActions() throws Exception {
        HttpResponse<String> commentResponse = post(CONNECTHUB_URL, "/api/feed/actions/comment", Map.of(
                "postId", postId,
                "commentText", "This is a test comment"
        ));

        Assertions.assertEquals(201, commentResponse.statusCode());

        HttpResponse<String> likeResponse = post(CONNECTHUB_URL,"/api/feed/actions/like", Map.of("postId", postId));
        Assertions.assertEquals(201, likeResponse.statusCode());
        Assertions.assertEquals("Post liked successfully", likeResponse.body());


        HttpResponse<String> response = get(CONNECTHUB_URL, "/api/feed/actions/post/" + postId);
        Assertions.assertEquals(200, response.statusCode());

        var jsonResponse = objectMapper.readTree(response.body());
        Assertions.assertEquals(1, jsonResponse.get("likesCount").asLong());
        Assertions.assertEquals(1, jsonResponse.get("commentsCount").asLong());
        Assertions.assertTrue(jsonResponse.get("isLikedByCurrentUser").asBoolean());
    }

     @AfterEach
     void afterEach() throws Exception {
         HttpResponse<String> deleteResponse = delete(CONNECTHUB_URL, "/api/feed/" + postId);
         Assertions.assertEquals(200, deleteResponse.statusCode());
     }

}
