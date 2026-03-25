package com.hatchloom.connecthub.connecthub_service.service;

import com.hatchloom.connecthub.connecthub_service.dto.*;
import com.hatchloom.connecthub.connecthub_service.enums.NotificationType;
import com.hatchloom.connecthub.connecthub_service.model.Notification;
import com.hatchloom.connecthub.connecthub_service.repository.ClassifiedPostRepository;
import com.hatchloom.connecthub.connecthub_service.repository.MessageRepository;
import com.hatchloom.connecthub.connecthub_service.repository.NotificationRepository;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.ObjectMapper;

import java.util.List;
import java.util.UUID;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class NotificationServiceTest {

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private ClassifiedPostRepository classifiedPostRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private BaseUser sender;
    private BaseUser recipient;
    private BaseUser thirdUser;
    private BaseProject project;

    private String senderToken;
    private String recipientToken;
    private String thirdUserToken;

    @BeforeEach
    void setup() {
        messageRepository.deleteAll();
        classifiedPostRepository.deleteAll();
        notificationRepository.deleteAll();
        sender = new BaseUser(UUID.fromString("00000000-0000-0000-0000-000000000001"), "Sender", "sender@gmail.com");
        recipient = new BaseUser(UUID.fromString("00000000-0000-0000-0000-000000000002"), "Recipient", "recipient@gmail.com");
        thirdUser = new BaseUser(UUID.fromString("00000000-0000-0000-0000-000000000003"), "Third User", "thirdUser@gmail.com");
        project = new BaseProject(UUID.fromString("00000000-0000-0000-0000-000000000011"), "Test Project", "This is a test project", sender, null);

        senderToken = JwtUtilTest.generateTestToken(sender.id);
        recipientToken = JwtUtilTest.generateTestToken(recipient.id);
        thirdUserToken = JwtUtilTest.generateTestToken(thirdUser.id);
    }

    @Test
    @DisplayName("Test that creating a classified post sends a notification to those subscribed")
    void testClassifiedPostNotification() throws Exception {

        mockMvc.perform(post("/api/classified/subscriptions")
                .contentType(MediaType.APPLICATION_JSON)
                .with(csrf())
                        .header("Authorization", "Bearer " + recipientToken))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/api/classified/subscriptions")
                .contentType(MediaType.APPLICATION_JSON)
                .with(csrf())
                        .header("Authorization", "Bearer " + thirdUserToken))
                .andExpect(status().isCreated());

        ClassifiedPostCreationRequest request = new ClassifiedPostCreationRequest(new BasePostRequest("Test classified", "Classified post"), project.id, "open");
        mockMvc.perform(post("/api/classified")
        .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request))
                .with(csrf())
                        .header("Authorization", "Bearer " + senderToken))
                .andExpect(status().isCreated());

        Assertions.assertEquals(2, notificationRepository.count());
        Assertions.assertEquals(1, notificationRepository.findByRecipientUserIdAndTypeOrderByCreatedAtDesc(recipient.id, NotificationType.CLASSIFIED_CREATED).size());
        Assertions.assertEquals(1, notificationRepository.findByRecipientUserIdAndTypeOrderByCreatedAtDesc(thirdUser.id, NotificationType.CLASSIFIED_CREATED).size());

        MvcResult res1 = mockMvc.perform(get("/api/notifications/classified", recipient.id)
                .param("unread", "true")
                        .header("Authorization", "Bearer " + recipientToken)
                .with(csrf()))
                .andExpect(status().isOk())
                .andReturn();

        String notifications1 = res1.getResponse().getContentAsString();
        List<NotificationResponse> notifications1List = objectMapper.readValue(notifications1, new TypeReference<List<NotificationResponse>>() {});

        MvcResult res2 = mockMvc.perform(get("/api/notifications/classified", thirdUser.id)
                .param("unread", "true")
                        .header("Authorization", "Bearer " + thirdUserToken)
                .with(csrf()))
                .andExpect(status().isOk())
                .andReturn();

        String notifications2 = res2.getResponse().getContentAsString();
        List<NotificationResponse> notifications2List = objectMapper.readValue(notifications2, new TypeReference<List<NotificationResponse>>() {});

        Assertions.assertEquals(1, notifications1List.size());
        Assertions.assertEquals(1, notifications2List.size());
    }

    @Test
    @DisplayName("Test that marking a notification as read works correctly")
    void testMarkNotificationAsRead() throws Exception {

        mockMvc.perform(post("/api/classified/subscriptions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .with(csrf())
                        .header("Authorization", "Bearer " + recipientToken))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/api/classified/subscriptions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .with(csrf())
                        .header("Authorization", "Bearer " + thirdUserToken))
                .andExpect(status().isCreated());

        ClassifiedPostCreationRequest request = new ClassifiedPostCreationRequest(new BasePostRequest("Test classified", "Classified post"), project.id, "open");
        mockMvc.perform(post("/api/classified")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request))
                        .with(csrf())
                        .header("Authorization", "Bearer " + senderToken))
                .andExpect(status().isCreated());

        Assertions.assertEquals(2, notificationRepository.count());
        Assertions.assertEquals(1, notificationRepository.findByRecipientUserIdAndTypeOrderByCreatedAtDesc(recipient.id, NotificationType.CLASSIFIED_CREATED).size());
        Assertions.assertEquals(1, notificationRepository.findByRecipientUserIdAndTypeOrderByCreatedAtDesc(thirdUser.id, NotificationType.CLASSIFIED_CREATED).size());

        MvcResult res1 = mockMvc.perform(get("/api/notifications/classified")
                        .param("unread", "true")
                        .header("Authorization", "Bearer " + recipientToken)
                        .with(csrf()))
                .andExpect(status().isOk())
                .andReturn();

        String notifications1 = res1.getResponse().getContentAsString();
        List<NotificationResponse> notifications1List = objectMapper.readValue(notifications1, new TypeReference<List<NotificationResponse>>() {});

        MvcResult res2 = mockMvc.perform(get("/api/notifications/classified", thirdUser.id)
                        .param("unread", "true")
                        .header("Authorization", "Bearer " + thirdUserToken)
                        .with(csrf()))
                .andExpect(status().isOk())
                .andReturn();

        String notifications2 = res2.getResponse().getContentAsString();
        List<NotificationResponse> notifications2List = objectMapper.readValue(notifications2, new TypeReference<List<NotificationResponse>>() {});

        Assertions.assertEquals(1, notifications1List.size());
        Assertions.assertEquals(1, notifications2List.size());

        Integer notificationId = notifications1List.getFirst().id();
        mockMvc.perform(patch("/api/notifications/{notificationId}/read", notificationId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(recipient.id))
                .with(csrf())
                        .header("Authorization", "Bearer " + recipientToken))
                .andExpect(status().isOk());

        MvcResult res3 = mockMvc.perform(get("/api/notifications/classified")
                        .param("unread", "true")
                        .header("Authorization", "Bearer " + recipientToken)
                        .with(csrf()))
                .andExpect(status().isOk())
                .andReturn();

        String notifications3 = res3.getResponse().getContentAsString();
        List<NotificationResponse> notifications3List = objectMapper.readValue(notifications3, new TypeReference<List<NotificationResponse>>() {});

        Assertions.assertEquals(0, notifications3List.size());
    }

    @Test
    @DisplayName("Test messaging notifications are sent when a message is created")
    void testMessageNotification() throws Exception {
        SendMessageRequest request = new SendMessageRequest(null, "Hello");
        mockMvc.perform(post("/api/message/{recipientId}/send", recipient.id)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request))
                .with(csrf())
                        .header("Authorization", "Bearer " + senderToken))
                .andExpect(status().isCreated());

        Assertions.assertEquals(1, notificationRepository.count());
        List<Notification> notifications = notificationRepository.findByRecipientUserIdAndTypeOrderByCreatedAtDesc(recipient.id, NotificationType.MESSAGE);
        Assertions.assertEquals(1, notifications.size());

        MvcResult res = mockMvc.perform(get("/api/notifications/messages")
                .param("unread", "true")
                        .header("Authorization", "Bearer " + recipientToken)
                .with(csrf()))
                .andExpect(status().isOk())
                .andReturn();

        String notificationsStr = res.getResponse().getContentAsString();
        List<NotificationResponse> notificationsList = objectMapper.readValue(notificationsStr, new TypeReference<List<NotificationResponse>>() {});
        Assertions.assertEquals(1, notificationsList.size());
    }

    @Test
    @DisplayName("Test that a user cannot mark another user's notification as read")
    void testMarkNotificationAsReadUnauthorized() throws Exception {

        mockMvc.perform(post("/api/classified/subscriptions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .with(csrf())
                        .header("Authorization", "Bearer " + recipientToken))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/api/classified/subscriptions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .with(csrf())
                        .header("Authorization", "Bearer " + thirdUserToken))
                .andExpect(status().isCreated());

        ClassifiedPostCreationRequest request = new ClassifiedPostCreationRequest(new BasePostRequest("Test classified", "Classified post"), project.id, "open");
        mockMvc.perform(post("/api/classified")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request))
                        .with(csrf())
                        .header("Authorization", "Bearer " + senderToken))
                .andExpect(status().isCreated());


        List<Notification> notifications = notificationRepository.findByRecipientUserIdAndTypeOrderByCreatedAtDesc(recipient.id, NotificationType.CLASSIFIED_CREATED);
        Integer notificationId = notifications.getFirst().getId();

        mockMvc.perform(patch("/api/notifications/{notificationId}/read", notificationId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(thirdUser.id))
                .with(csrf())
                        .header("Authorization", "Bearer " + thirdUserToken))
                .andExpect(status().isBadRequest());
    }
}
