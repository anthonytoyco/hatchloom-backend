package com.hatchloom.connecthub.connecthub_service.service;

import java.util.UUID;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.hatchloom.connecthub.connecthub_service.config.TestSecurityConfig;
import com.hatchloom.connecthub.connecthub_service.dto.SendMessageRequest;
import com.hatchloom.connecthub.connecthub_service.model.Conversations;
import com.hatchloom.connecthub.connecthub_service.model.Messages;
import com.hatchloom.connecthub.connecthub_service.repository.MessageRepository;

import tools.jackson.databind.ObjectMapper;

@SpringBootTest
@AutoConfigureMockMvc
@Import(TestSecurityConfig.class)
@Tag("integration")
public class MessageIntegrationTest {

        @Autowired
        private MessageRepository messageRepository;

        @Autowired
        private MockMvc mockMvc;

        @Autowired
        private ObjectMapper objectMapper;

        private BaseUser sender;
        private BaseUser recipient;
        private BaseUser outsider;

        private String senderUserToken;
        private String recipientUserToken;
        private String outsiderUserToken;

        @BeforeEach
        void setup() {
                messageRepository.deleteAll();
                sender = new BaseUser(UUID.fromString("00000000-0000-0000-0000-000000000001"), "Sender",
                                "sender@gmail.com");
                recipient = new BaseUser(UUID.fromString("00000000-0000-0000-0000-000000000002"), "Recipient",
                                "recipient@gmail.com");
                outsider = new BaseUser(UUID.fromString("00000000-0000-0000-0000-000000000003"), "Outsider",
                                "outsider@gmail.com");

                senderUserToken = JwtUtilTest.generateTestToken(sender.id);
                recipientUserToken = JwtUtilTest.generateTestToken(recipient.id);
                outsiderUserToken = JwtUtilTest.generateTestToken(outsider.id);
        }

        @Test
        @DisplayName("Test sending a message successfully")
        void testSendMessageSuccess() throws Exception {
                SendMessageRequest request = new SendMessageRequest(null, "Hello how are you");

                mockMvc.perform(post("/api/message/{recipientId}/send", recipient.id)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request))
                                .with(csrf())
                                .header("Authorization", "Bearer " + senderUserToken))
                                .andExpect(status().isCreated())
                                .andExpect(jsonPath("conversationId").exists())
                                .andExpect(jsonPath("messageId").exists())
                                .andExpect(jsonPath("senderId").value(sender.id.toString()))
                                .andExpect(jsonPath("recipientId").value(recipient.id.toString()))
                                .andExpect(jsonPath("content").value("Hello how are you"));

                Messages savedMessage = messageRepository.findAll().getFirst();
                Assertions.assertEquals(1, messageRepository.count());
                Assertions.assertEquals(sender.id, savedMessage.getSenderId());
                Assertions.assertEquals("Hello how are you", savedMessage.getContent());
                Assertions.assertEquals(UUID.fromString("00000000-0000-0000-0000-000000000001"),
                                savedMessage.getConversation().getUser1Id());
                Assertions.assertEquals(UUID.fromString("00000000-0000-0000-0000-000000000002"),
                                savedMessage.getConversation().getUser2Id());
        }

        @Test
        @DisplayName("Test sending a message with missing content")
        void testSendMessageMissingContent() throws Exception {
                SendMessageRequest request = new SendMessageRequest(null, "   ");

                mockMvc.perform(post("/api/message/{recipientId}/send", recipient.id)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request))
                                .with(csrf())
                                .header("Authorization", "Bearer " + senderUserToken))
                                .andExpect(status().isBadRequest());

                Assertions.assertEquals(0, messageRepository.count());
        }

        @Test
        @DisplayName("Test sending a message to self")
        void testSendMessageToSelf() throws Exception {
                SendMessageRequest request = new SendMessageRequest(null, "Hello myself");
                mockMvc.perform(post("/api/message/{recipientId}/send", sender.id)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request))
                                .with(csrf())
                                .header("Authorization", "Bearer " + senderUserToken))
                                .andExpect(status().isBadRequest());

                Assertions.assertEquals(0, messageRepository.count());
        }

        @Test
        @DisplayName("Test sending a message to non-existent conversation")
        void testSendMessageNonExistentConversation() throws Exception {
                SendMessageRequest request = new SendMessageRequest(
                                UUID.fromString("00000000-0000-0000-0000-000000000004"), "Hello");
                mockMvc.perform(post("/api/message/{recipientId}/send", recipient.id)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request))
                                .with(csrf())
                                .header("Authorization", "Bearer " + senderUserToken))
                                .andExpect(status().isBadRequest());

                Assertions.assertEquals(0, messageRepository.count());
        }

        @Test
        @DisplayName("Test receiving a message where a user is not a participant in")
        void testGetMessageUserNotParticipant() throws Exception {
                SendMessageRequest request = new SendMessageRequest(null, "Hello");
                mockMvc.perform(post("/api/message/{recipientId}/send", recipient.id)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request))
                                .with(csrf())
                                .header("Authorization", "Bearer " + senderUserToken))
                                .andExpect(status().isCreated());

                mockMvc.perform(get("/api/message/conversation/{conversationId}", 1)
                                .with(csrf())
                                .header("Authorization", "Bearer " + outsiderUserToken))
                                .andExpect(status().isBadRequest());

                Assertions.assertEquals(1, messageRepository.count());
        }

        @Test
        @DisplayName("Test sending a message where a user is not a participant in the conversation")
        void testSendMessageUserNotParticipantInConversation() throws Exception {
                SendMessageRequest request = new SendMessageRequest(null, "Hello");
                mockMvc.perform(post("/api/message/{recipientId}/send", recipient.id)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request))
                                .with(csrf())
                                .header("Authorization", "Bearer " + senderUserToken))
                                .andExpect(status().isCreated());

                Conversations conversation = messageRepository.findAll().getFirst().getConversation();

                SendMessageRequest invalidRequest = new SendMessageRequest(conversation.getId(), "Hi");
                mockMvc.perform(post("/api/message/{recipientId}/send", recipient.id)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(invalidRequest))
                                .with(csrf())
                                .header("Authorization", "Bearer " + outsiderUserToken))
                                .andExpect(status().isBadRequest());

                Assertions.assertEquals(1, messageRepository.count());
        }

        @Test
        @DisplayName("Test getting messages from a conversation successfully")
        void testGetConversationMessagesSuccess() throws Exception {
                SendMessageRequest request = new SendMessageRequest(null, "Hello");
                mockMvc.perform(post("/api/message/{recipientId}/send", recipient.id)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request))
                                .with(csrf())
                                .header("Authorization", "Bearer " + senderUserToken))
                                .andExpect(status().isCreated());

                Conversations conversation = messageRepository.findAll().getFirst().getConversation();

                SendMessageRequest request2 = new SendMessageRequest(conversation.getId(), "Hi there");
                mockMvc.perform(post("/api/message/{recipientId}/send", sender.id)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request2))
                                .with(csrf())
                                .header("Authorization", "Bearer " + recipientUserToken))
                                .andExpect(status().isCreated());

                mockMvc.perform(get("/api/message/conversation/{conversationId}", conversation.getId())
                                .with(csrf())
                                .header("Authorization", "Bearer " + senderUserToken))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$[0].conversationId").exists())
                                .andExpect(jsonPath("$[0].senderId").value(sender.id.toString()))
                                .andExpect(jsonPath("$[0].content").value("Hello"))
                                .andExpect(jsonPath("$[1].conversationId").exists())
                                .andExpect(jsonPath("$[1].senderId").value(recipient.id.toString()))
                                .andExpect(jsonPath("$[1].content").value("Hi there"));

                Assertions.assertEquals(2, messageRepository.count());
        }
}
