package com.hatchloom.connecthub.connecthub_service.service;

import com.hatchloom.connecthub.connecthub_service.dto.BasePostRequest;
import com.hatchloom.connecthub.connecthub_service.dto.CursorResponse;
import com.hatchloom.connecthub.connecthub_service.dto.FeedPostResponse;
import com.hatchloom.connecthub.connecthub_service.dto.PostCreationRequest;
import com.hatchloom.connecthub.connecthub_service.model.Post;
import com.hatchloom.connecthub.connecthub_service.model.SharePost;
import com.hatchloom.connecthub.connecthub_service.repository.FeedPostRepository;
import jakarta.transaction.Transactional;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import com.hatchloom.connecthub.connecthub_service.config.TestSecurityConfig;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import tools.jackson.databind.ObjectMapper;

import java.util.List;
import java.util.UUID;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;


@SpringBootTest
@AutoConfigureMockMvc
@Import(TestSecurityConfig.class)
class FeedPostServiceTest {
    @Autowired
    private FeedPostRepository feedPostRepository;

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private BaseUser testUser;

    private UUID unauthorizedUserId;

    private String testUserToken;
    private String unauthorizedUserToken;

    @BeforeEach
    void setup() {
        feedPostRepository.deleteAll();
        testUser = new BaseUser(UUID.fromString("00000000-0000-0000-0000-000000000001"), "Test User", "Test@gmail.com");
        unauthorizedUserId = UUID.fromString("00000000-0000-0000-0000-000000000099");

        testUserToken = JwtUtilTest.generateTestToken(testUser.id);
        unauthorizedUserToken = JwtUtilTest.generateTestToken(unauthorizedUserId);
    }

    @Test
    @DisplayName("Test creating a new feed post successfully")
    void testCreateFeedPost() throws Exception {
        PostCreationRequest dto = new PostCreationRequest(new BasePostRequest("Test Post 1", "This is a test post"), "share");

        mockMvc.perform(post("/api/feed")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto))
                .with(csrf())
                        .header("Authorization", "Bearer " + testUserToken))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title").value("Test Post 1"))
                .andExpect(jsonPath("$.content").value("This is a test post"))
                .andExpect(jsonPath("$.author").value(testUser.id.toString()));

        Assertions.assertEquals(1, feedPostRepository.count());
        Post saved = feedPostRepository.findAll().getFirst();

        SharePost post = (SharePost) saved;

        Assertions.assertEquals("Test Post 1", post.getTitle());
        Assertions.assertEquals("This is a test post", post.getContent());
        Assertions.assertEquals(testUser.id, post.getAuthor());
    }

    @Test
    @DisplayName("Test creating a feed post with missing title")
    void createFeedPost_MissingTitle() throws Exception {
        PostCreationRequest dto = new PostCreationRequest(new BasePostRequest("", "This is a test post"), "share");

        mockMvc.perform(post("/api/feed")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto))
                        .with(csrf())
                        .header("Authorization", "Bearer " + testUserToken))
                .andExpect(status().isBadRequest());

        Assertions.assertEquals(0, feedPostRepository.count());
    }

    @Test
    @DisplayName("Test creating a feed post with missing content and author")
    void createFeedPost_MissingOtherInformation() throws Exception {
        PostCreationRequest dto = new PostCreationRequest(new BasePostRequest("Test Post 3", ""), "share");

        mockMvc.perform(post("/api/feed")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto))
                        .with(csrf())
                        .header("Authorization", "Bearer " + testUserToken))
                .andExpect(status().isBadRequest());

        Assertions.assertEquals(0, feedPostRepository.count());
    }

    @Test
    @DisplayName("Test create different types of feed posts")
    void createFeedPost_DifferentTypes() throws Exception {
        String[] postTypes = {"share", "announcement", "achievement"};
        for (String post : postTypes) {
            PostCreationRequest dto = new PostCreationRequest(new BasePostRequest("Test " + post, "This is a test " + post), post);

            mockMvc.perform(post("/api/feed")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(dto))
                            .with(csrf())
                            .header("Authorization", "Bearer " + testUserToken))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.title").value("Test " + post))
                    .andExpect(jsonPath("$.content").value("This is a test " + post))
                    .andExpect(jsonPath("$.author").value(testUser.id.toString()));
        }

        Assertions.assertEquals(3, feedPostRepository.count());
    }

    @Test
    @DisplayName("Test creating a feed post with invalid post type")
    void createFeedPost_InvalidPostType() throws Exception {
        PostCreationRequest dto = new PostCreationRequest(new BasePostRequest("Test Invalid", "This is a test post with invalid type"), "invalidType");

        mockMvc.perform(post("/api/feed")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto))
                        .with(csrf())
                        .header("Authorization", "Bearer " + testUserToken))
                .andExpect(status().isBadRequest());

        Assertions.assertEquals(0, feedPostRepository.count());
    }

    @Test
    @DisplayName("Test creating a feed post with null post type")
    void createFeedPost_NullPostType() throws Exception {
        PostCreationRequest dto = new PostCreationRequest(new BasePostRequest("Test Null Type", "This is a test post with null type"), null);

        mockMvc.perform(post("/api/feed")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto))
                        .with(csrf())
                        .header("Authorization", "Bearer " + testUserToken))
                .andExpect(status().isBadRequest());

        Assertions.assertEquals(0, feedPostRepository.count());
    }

    @Test
    @Transactional
    @DisplayName("Test deleting a feed post successfully")
    void deleteFeedPost() throws Exception {
        PostCreationRequest dto = new PostCreationRequest(new BasePostRequest("Test Post to Delete", "This post will be deleted"), "share");
        mockMvc.perform(post("/api/feed")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto))
                .with(csrf())
                        .header("Authorization", "Bearer " + testUserToken))
                .andExpect(status().isCreated());

        List<Post> posts = feedPostRepository.findAll();
        Post post = posts.getFirst();

        mockMvc.perform(delete("/api/feed/{postId}", post.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .with(csrf())
                        .header("Authorization", "Bearer " + testUserToken))
                .andExpect(status().isOk())
                .andExpect(content().string("Post deleted successfully"));

        Assertions.assertEquals(0, feedPostRepository.count());
    }

    @Test
    @Transactional
    @DisplayName("Test deleting a post with invalid post Id")
    void deleteFeedPost_Invalid_PostId() throws Exception {
        PostCreationRequest dto = new PostCreationRequest(new BasePostRequest("Test Post to Delete", "This post will be deleted"), "share");
        mockMvc.perform(post("/api/feed")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto))
                .with(csrf())
                        .header("Authorization", "Bearer " + testUserToken))
                .andExpect(status().isCreated());


        mockMvc.perform(delete("/api/feed/{postId}", 999)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto))
                .with(csrf())
                        .header("Authorization", "Bearer " + testUserToken))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("Post with ID 999 does not exist"));

        Assertions.assertEquals(1, feedPostRepository.count());
    }

    @Test
    @DisplayName("Test deleting a feed post with invalid user")
    void deleteFeedPost_InvalidUser() throws Exception {
        PostCreationRequest dto = new PostCreationRequest(new BasePostRequest("Test Post to Delete", "This post will be deleted"), "share");
        mockMvc.perform(post("/api/feed")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto))
                .with(csrf())
                        .header("Authorization", "Bearer " + testUserToken))
                .andExpect(status().isCreated());

        List<Post> posts = feedPostRepository.findAll();
        Post post = posts.getFirst();

        mockMvc.perform(delete("/api/feed/{postId}", post.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .with(csrf())
                        .header("Authorization", "Bearer " + unauthorizedUserToken))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("User " + (unauthorizedUserId) + " is not authorized to delete post " + post.getId()));

        Assertions.assertEquals(1, feedPostRepository.count());
    }

    @Test
    @DisplayName("Test fetching posts for first page")
    void testGetFeedPostsWithPagination() throws Exception {
        for (int i = 1; i <= 45; i++) {
            PostCreationRequest dto = new PostCreationRequest(new BasePostRequest("Test Post " + i, "This is test post number " + i), "share");
            mockMvc.perform(post("/api/feed")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(dto))
                    .with(csrf())
                            .header("Authorization", "Bearer " + testUserToken))
                    .andExpect(status().isCreated());
        }

        mockMvc.perform(get("/api/feed")
                .param("limit", "25")
                .with(csrf())
                        .header("Authorization", "Bearer " + testUserToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.length()").value(25))
                .andExpect(jsonPath("$.hasNext").value(true))
                .andExpect(jsonPath("$.nextCursor").isNotEmpty());
    }

    @Test
    @DisplayName("Test fetching posts across multiple pages")
    void testGetPostsMultiplePages() throws Exception {
        int upperLimit = 100;
        boolean hasMore;
        String nextCursor = "";
        int totalFetched = 0;

        for (int i = 0; i < upperLimit; i++) {
            PostCreationRequest dto = new PostCreationRequest(new BasePostRequest("Test Post " + (i), "This is test post number " + (i)), "share");
            mockMvc.perform(post("/api/feed")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(dto))
                    .with(csrf())
                            .header("Authorization", "Bearer " + testUserToken))
                    .andExpect(status().isCreated());
        }

        for (int i = upperLimit; i < upperLimit * 2; i++) {
            PostCreationRequest dto = new PostCreationRequest(new BasePostRequest("Test Post " + (i), "This is test post number " + (i)), "achievement");
            mockMvc.perform(post("/api/feed")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(dto))
                    .with(csrf())
                            .header("Authorization", "Bearer " + testUserToken))
                    .andExpect(status().isCreated());
        }

        while (true) {
            String response = mockMvc.perform(get("/api/feed")
                    .param("limit", "25").param("after", nextCursor)
                    .with(csrf())
                            .header("Authorization", "Bearer " + testUserToken))
                    .andExpect(status().isOk())
                    .andReturn().getResponse().getContentAsString();

            CursorResponse<FeedPostResponse> cursorResponse = objectMapper.readValue(response, objectMapper.getTypeFactory().constructParametricType(CursorResponse.class, FeedPostResponse.class));
            List<FeedPostResponse> posts = cursorResponse.getData();
            for (FeedPostResponse post : posts) {
                Assertions.assertNotNull(post.id());
                Assertions.assertNotNull(post.title());
                Assertions.assertNotNull(post.content());
                Assertions.assertNotNull(post.author());
                totalFetched++;
            }

            String next = cursorResponse.getNextCursor();
            hasMore = cursorResponse.isHasNext();
            if (!hasMore) {
                break;
            }
            nextCursor = next;
        }

        Assertions.assertFalse(hasMore);
        Assertions.assertEquals(upperLimit * 2, totalFetched);
    }
}
