package com.hatchloom.connecthub.connecthub_service.controller;

import java.util.UUID;

import org.junit.jupiter.api.Test;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.hatchloom.connecthub.connecthub_service.model.Post;
import com.hatchloom.connecthub.connecthub_service.model.SharePost;
import com.hatchloom.connecthub.connecthub_service.service.FeedActionService;
import com.hatchloom.connecthub.connecthub_service.service.FeedPostService;
import com.hatchloom.connecthub.connecthub_service.utils.JwtUtil;

@WebMvcTest(FeedPostController.class)
@AutoConfigureMockMvc(addFilters = false)
class FeedPostControllerWebMvcTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private FeedPostService feedPostService;

    @MockitoBean
    private FeedActionService feedActionService;

    @MockitoBean
    private JwtUtil jwtUtil;

    @Test
    void createPost_validRequest_returnsCreated() throws Exception {
        UUID userId = UUID.randomUUID();
        Post savedPost = new SharePost("Title", "Content", userId);

        when(jwtUtil.extractUserId("Bearer token")).thenReturn(userId);
        when(feedPostService.createFeedPost(any(), eq(userId))).thenReturn(savedPost);

        mockMvc.perform(post("/api/feed")
                .header("Authorization", "Bearer token")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"basePost\":{\"title\":\"Title\",\"content\":\"Content\"},\"postType\":\"share\"}"))
                .andExpect(status().isCreated());
    }

    @Test
    void createPost_missingFields_returnsBadRequest() throws Exception {
        UUID userId = UUID.randomUUID();

        when(jwtUtil.extractUserId("Bearer token")).thenReturn(userId);
        when(feedPostService.createFeedPost(any(), eq(userId)))
                .thenThrow(new IllegalArgumentException("Post title must not be null or blank"));

        mockMvc.perform(post("/api/feed")
                .header("Authorization", "Bearer token")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"basePost\":{\"title\":\"\",\"content\":\"Content\"},\"postType\":\"share\"}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void getFeedPost_whenServiceThrows_returnsBadRequest() throws Exception {
        when(jwtUtil.extractUserId("Bearer token")).thenReturn(UUID.randomUUID());
        when(feedPostService.getAllFeedPosts(null, 25)).thenThrow(new IllegalArgumentException("invalid"));

        mockMvc.perform(get("/api/feed")
                .header("Authorization", "Bearer token"))
                .andExpect(status().isBadRequest());
    }
}
