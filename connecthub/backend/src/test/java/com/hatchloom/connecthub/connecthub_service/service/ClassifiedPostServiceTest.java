package com.hatchloom.connecthub.connecthub_service.service;

import com.hatchloom.connecthub.connecthub_service.dto.*;
import com.hatchloom.connecthub.connecthub_service.model.ClassifiedPost;
import com.hatchloom.connecthub.connecthub_service.repository.ClassifiedPostApplicationRepository;
import com.hatchloom.connecthub.connecthub_service.repository.ClassifiedPostRepository;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import tools.jackson.databind.ObjectMapper;

import java.util.List;
import java.util.UUID;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class ClassifiedPostServiceTest {
    @Autowired
    ClassifiedPostRepository classifiedPostRepository;

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private ClassifiedPostApplicationRepository classifiedPostApplicationRepository;

    private BaseUser testUser;
    private BaseUser testUser2;
    private BaseProject testProject;
    private String testUserToken;
    private String testUser2Token;

    @BeforeEach
    void setup() {
        classifiedPostRepository.deleteAll();
        classifiedPostApplicationRepository.deleteAll();
        testUser = new BaseUser(UUID.fromString("00000000-0000-0000-0000-000000000001"), "testuser", "test@gmail.com");
        testProject = new BaseProject(UUID.fromString("00000000-0000-0000-0000-000000000002"), "Test Project", "A project for testing", testUser, List.of());
        testUser2 = new BaseUser(UUID.fromString("00000000-0000-0000-0000-000000000003"), "testuser2", "test2@gmail.com");

        testUserToken = JwtUtilTest.generateTestToken(testUser.id);
        testUser2Token = JwtUtilTest.generateTestToken(testUser2.id);
    }

    @Test
    @DisplayName("Test creating a classified post with valid data")
    void testCreateClassifiedPost() throws Exception {
        ClassifiedPostCreationRequest dto = new ClassifiedPostCreationRequest(new BasePostRequest("Classified test post",
                "This is a classified test"), testProject.id, "open");

        mockMvc.perform(post("/api/classified")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto))
                .with(csrf())
                .header("Authorization", "Bearer " + testUserToken))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title").value("Classified test post"))
                .andExpect(jsonPath("$.content").value("This is a classified test"))
                .andExpect(jsonPath("$.author").value(testUser.id.toString()))
                .andExpect(jsonPath("$.projectId").value(testProject.id.toString()))
                .andExpect(jsonPath("$.status").value("open"));

        ClassifiedPost post = classifiedPostRepository.findAll().getFirst();
        Assertions.assertEquals(1, classifiedPostRepository.count());
        Assertions.assertEquals(post.getProjectId(), testProject.id);
        Assertions.assertEquals(post.getAuthor(), testUser.id);
    }

    @Test
    @DisplayName("Test creating a classified post with invalid status")
    void testCreateClassifiedPostInvalidStatus() throws Exception {
        ClassifiedPostCreationRequest dto = new ClassifiedPostCreationRequest(new BasePostRequest("Classified test post",
                "This is a classified test"), testProject.id, "invalid_status");

        mockMvc.perform(post("/api/classified")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto))
                .with(csrf())
                        .header("Authorization", "Bearer " + testUserToken))
                .andExpect(status().isBadRequest());

        Assertions.assertEquals(0, classifiedPostRepository.count());
    }

    @Test
    @DisplayName("Test creating a classified post with null fields")
    void testCreateClassifiedPostNullFields() throws Exception {
        ClassifiedPostCreationRequest dto = new ClassifiedPostCreationRequest(new BasePostRequest("", ""), null, "open");

        mockMvc.perform(post("/api/classified")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto))
                .with(csrf())
                        .header("Authorization", "Bearer " + testUserToken))
                .andExpect(status().isBadRequest());

        Assertions.assertEquals(0, classifiedPostRepository.count());
    }

    @Test
    @DisplayName("Test creating a classified post with long title")
    void testCreateClassifiedPostLongTitle() throws Exception {
        ClassifiedPostCreationRequest dto = new ClassifiedPostCreationRequest(new BasePostRequest("A".repeat(300),
                "This is a classified test"), testProject.id, "open");

        mockMvc.perform(post("/api/classified")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto))
                .with(csrf())
                        .header("Authorization", "Bearer " + testUserToken))
                .andExpect(status().isBadRequest());

        Assertions.assertEquals(0, classifiedPostRepository.count());
    }

    @Test
    @DisplayName("Test creating a classified post with long content")
    void testCreateClassifiedPostLongContent() throws Exception {
        ClassifiedPostCreationRequest dto = new ClassifiedPostCreationRequest(new BasePostRequest("Classified test post",
                "A".repeat(3001)), testProject.id, "open");

        mockMvc.perform(post("/api/classified")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto))
                .with(csrf())
                        .header("Authorization", "Bearer " + testUserToken))
                .andExpect(status().isBadRequest());

        Assertions.assertEquals(0, classifiedPostRepository.count());
    }

    @Test
    @DisplayName("Test get filtered classifeid posts")
    void testFilterClassifiedPosts() throws Exception {
        String[] statuses = {"open", "open", "open", "filled", "closed"};

        for (String status : statuses) {
            ClassifiedPostCreationRequest dto = new ClassifiedPostCreationRequest(new BasePostRequest("Classified test post",
                    "This is a classified test"), testProject.id, status);

            mockMvc.perform(post("/api/classified")
            .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(dto))
                    .with(csrf())
                            .header("Authorization", "Bearer " + testUserToken))
                    .andExpect(status().isCreated());
        }

        mockMvc.perform(get("/api/classified/filtered")
                .param("statusType", "open")
                        .with(csrf())
                        .header("Authorization", "Bearer " + testUserToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(3));

        mockMvc.perform(get("/api/classified/filtered")
                .param("statusType", "invalid")
                .with(csrf())
                        .header("Authorization", "Bearer " + testUserToken))
                        .andExpect(status().isBadRequest());

        mockMvc.perform(get("/api/classified/filtered")
                        .param("statusType", "filled")
                        .with(csrf())
                        .header("Authorization", "Bearer " + testUserToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));

        Assertions.assertEquals(5, classifiedPostRepository.count());
    }

    @Test
    @DisplayName("Test update classified post status")
    void testUpdateClassifiedPostStatus() throws Exception {
        ClassifiedPostCreationRequest dto = new ClassifiedPostCreationRequest(new BasePostRequest("Classified test post",
                "This is a classified test"), testProject.id, "open");

        String response = mockMvc.perform(post("/api/classified")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto))
                .with(csrf())
                        .header("Authorization", "Bearer " + testUserToken))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        ClassifiedPost createdPost = objectMapper.readValue(response, ClassifiedPost.class);

        UpdateClassifiedStatusRequest updateDto = new UpdateClassifiedStatusRequest("filled");
        mockMvc.perform(put("/api/classified/{postId}/status", createdPost.getId())
                        .content(objectMapper.writeValueAsString(updateDto))
                        .contentType(MediaType.APPLICATION_JSON)
                .with(csrf())
                        .header("Authorization", "Bearer " + testUserToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("filled"));

        ClassifiedPost updatedPost = classifiedPostRepository.findById(createdPost.getId()).orElseThrow();
        Assertions.assertEquals("filled", updatedPost.getStatus());
    }

    @Test
    @DisplayName("Test update classified post status with a post that doesn't exist")
    void testUpdateClassifiedPostStatusInvalidStatus() throws Exception {
        ClassifiedPostCreationRequest dto = new ClassifiedPostCreationRequest(new BasePostRequest("Classified test post",
                "This is a classified test"), testProject.id, "open");

        mockMvc.perform(post("/api/classified")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto))
                .with(csrf())
                        .header("Authorization", "Bearer " + testUserToken))
                .andExpect(status().isCreated());

        mockMvc.perform(put("/api/classified/{postId}/status", 999)

                        .param("newStatus", "filled")
                        .with(csrf())
                        .header("Authorization", "Bearer " + testUserToken))
                .andExpect(status().isBadRequest());

        Assertions.assertEquals(1, classifiedPostRepository.count());
        ClassifiedPost post = classifiedPostRepository.findAll().getFirst();
        Assertions.assertEquals("open", post.getStatus());
    }

    @Test
    @DisplayName("Test fetching classified posts for first page")
    void testGetClassifiedPostsWithPagination() throws Exception {
        int upperLimit = 100;

        for (int i = 0; i < upperLimit; i++) {
            ClassifiedPostCreationRequest dto = new ClassifiedPostCreationRequest(new BasePostRequest("Classified test post" + i,
                    "This is a classified test"), testProject.id, "open");

            mockMvc.perform(post("/api/classified")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(dto))
            .with(csrf())
                            .header("Authorization", "Bearer " + testUserToken))
                    .andExpect(status().isCreated());
        }

        mockMvc.perform(get("/api/classified")
                .param("limit", "25")
                .with(csrf())
                        .header("Authorization", "Bearer " + testUserToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.length()").value(25))
                .andExpect(jsonPath("$.hasNext").value(true))
                .andExpect(jsonPath("$.nextCursor").isNotEmpty());

    }

    @Test
    @DisplayName("Test fetching classified posts across multiple pages")
    void testGetClassifiedPostsMultiplePages() throws Exception {
        int upperLimit = 100;
        boolean hasMore;
        String nextCursor = "";
        int totalFetched = 0;

        for (int i = 0; i < upperLimit; i++) {
            ClassifiedPostCreationRequest dto = new ClassifiedPostCreationRequest(new BasePostRequest("Classified test post" + i,
                    "This is a classified test"), testProject.id, "open");

            mockMvc.perform(post("/api/classified")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(dto))
                            .with(csrf())
                            .header("Authorization", "Bearer " + testUserToken))
                    .andExpect(status().isCreated());
        }

        while (true) {
            String response = mockMvc.perform(get("/api/classified")
                    .param("limit", "25").param("after", nextCursor)
                    .with(csrf())
                            .header("Authorization", "Bearer " + testUserToken))
                    .andExpect(status().isOk())
                    .andReturn().getResponse().getContentAsString();

            CursorResponse<ClassifiedPost> cursorResponse = objectMapper.readValue(response, objectMapper.getTypeFactory().constructParametricType(CursorResponse.class, ClassifiedPost.class));
            List<ClassifiedPost> posts = cursorResponse.getData();

            for (ClassifiedPost post : posts) {
                Assertions.assertEquals("open", post.getStatus());
                Assertions.assertNotNull(post.getId());
                Assertions.assertNotNull(post.getTitle());
                Assertions.assertNotNull(post.getContent());
                Assertions.assertNotNull(post.getAuthor());
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
        Assertions.assertEquals(upperLimit, totalFetched);
    }

    @Test
    @DisplayName("Test fetching classified posts with invalid status")
    void testGetClassifiedPostsInvalidStatus() throws Exception {
        mockMvc.perform(get("/api/classified")
                .param("statusType", "invalid")
                .with(csrf())
                        .header("Authorization", "Bearer " + testUserToken))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Test applying to a classified post")
    void testApplyClassifiedPost() throws Exception {
        ClassifiedPostCreationRequest dto = new ClassifiedPostCreationRequest(new BasePostRequest("Classified test post",
                "This is a classified test"), testProject.id, "open");

        String response = mockMvc.perform(post("/api/classified")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto))
                .with(csrf())
                        .header("Authorization", "Bearer " + testUserToken))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        ClassifiedPost createdPost = objectMapper.readValue(response, ClassifiedPost.class);

        mockMvc.perform(post("/api/classified/{postId}/apply", createdPost.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .with(csrf())
                        .header("Authorization", "Bearer " + testUser2Token))
                .andExpect(status().isOk());

        mockMvc.perform(post("/api/classified/{postId}/apply", createdPost.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .with(csrf())
                        .header("Authorization", "Bearer " + testUser2Token))
                .andExpect(status().isBadRequest());

        Assertions.assertEquals(1, classifiedPostApplicationRepository.count());
    }

    @Test
    @DisplayName("Test applying to a classified post that is not open")
    void testApplyClassifiedPostInvalidStatus() throws Exception {
        ClassifiedPostCreationRequest dto = new ClassifiedPostCreationRequest(new BasePostRequest("Classified test post",
                "This is a classified test"), testProject.id, "filled");

        String response = mockMvc.perform(post("/api/classified")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto))
                        .with(csrf())
                        .header("Authorization", "Bearer " + testUserToken))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        ClassifiedPost createdPost = objectMapper.readValue(response, ClassifiedPost.class);


        mockMvc.perform(post("/api/classified/{postId}/apply", createdPost.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .with(csrf())
                        .header("Authorization", "Bearer " + testUser2Token))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Test applying to a classified post that doesn't exist")
    void testApplyClassifiedPostInvalidPost() throws Exception {


        mockMvc.perform(post("/api/classified/{postId}/apply", 999)
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("Authorization", "Bearer " + testUser2Token))
                .andExpect(status().isBadRequest());

        Assertions.assertEquals(0, classifiedPostApplicationRepository.count());
    }

    @Test
    @DisplayName("Test get all applications for a classified post")
    void testGetClassifiedPostApplications() throws Exception {
        ClassifiedPostCreationRequest dto = new ClassifiedPostCreationRequest(new BasePostRequest("Classified test post",
                "This is a classified test"), testProject.id, "open");

        String response = mockMvc.perform(post("/api/classified")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto))
                        .with(csrf())
                        .header("Authorization", "Bearer " + testUserToken))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        ClassifiedPost createdPost = objectMapper.readValue(response, ClassifiedPost.class);

        mockMvc.perform(post("/api/classified/{postId}/apply", createdPost.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .with(csrf())
                        .header("Authorization", "Bearer " + testUser2Token))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/classified/{postId}/applications", createdPost.getId())
                        .with(csrf())
                        .header("Authorization", "Bearer " + testUserToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));

    }

    @Test
    @DisplayName("Test get applications for a user")
    void testGetUserApplications() throws Exception {
        ClassifiedPostCreationRequest dto = new ClassifiedPostCreationRequest(new BasePostRequest("Classified test post",
                "This is a classified test"), testProject.id, "open");

        String response = mockMvc.perform(post("/api/classified")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto))
                        .with(csrf())
                        .header("Authorization", "Bearer " + testUserToken))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        ClassifiedPost createdPost = objectMapper.readValue(response, ClassifiedPost.class);

        mockMvc.perform(post("/api/classified/{postId}/apply", createdPost.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .with(csrf())
                        .header("Authorization", "Bearer " + testUser2Token))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/classified/applications/me")
                        .with(csrf())
                        .header("Authorization", "Bearer " + testUser2Token))
                .andExpect(status().isOk());
    }
}
