package com.hatchloom.connecthub.connecthub_service.controller;

import java.time.LocalDateTime;
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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.hatchloom.connecthub.connecthub_service.dto.SendMessageResponse;
import com.hatchloom.connecthub.connecthub_service.service.MessageService;
import com.hatchloom.connecthub.connecthub_service.utils.JwtUtil;

@WebMvcTest(MessageController.class)
@AutoConfigureMockMvc(addFilters = false)
class MessageControllerWebMvcTest {

        @Autowired
        private MockMvc mockMvc;

        @MockitoBean
        private MessageService messageService;

        @MockitoBean
        private JwtUtil jwtUtil;

        @Test
        void sendMessage_validRequest_returnsCreated() throws Exception {
                UUID senderId = UUID.randomUUID();
                UUID recipientId = UUID.randomUUID();
                UUID conversationId = UUID.randomUUID();
                UUID messageId = UUID.randomUUID();

                SendMessageResponse response = new SendMessageResponse(
                                conversationId,
                                messageId,
                                senderId,
                                recipientId,
                                "hello",
                                LocalDateTime.now());

                when(jwtUtil.extractUserId("Bearer token")).thenReturn(senderId);
                when(messageService.sendMessage(eq(conversationId), eq(senderId), eq(recipientId), eq("hello")))
                                .thenReturn(response);

                mockMvc.perform(post("/api/message/{recipientId}/send", recipientId)
                                .header("Authorization", "Bearer token")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("{\"conversationId\":\"" + conversationId + "\",\"content\":\"hello\"}"))
                                .andExpect(status().isCreated());
        }

        @Test
        void sendMessage_missingBodyFields_returnsBadRequest() throws Exception {
                UUID senderId = UUID.randomUUID();
                UUID recipientId = UUID.randomUUID();

                when(jwtUtil.extractUserId("Bearer token")).thenReturn(senderId);
                when(messageService.sendMessage(any(), eq(senderId), eq(recipientId), eq(null)))
                                .thenThrow(new IllegalArgumentException("Invalid input"));

                mockMvc.perform(post("/api/message/{recipientId}/send", recipientId)
                                .header("Authorization", "Bearer token")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("{\"conversationId\":null,\"content\":null}"))
                                .andExpect(status().isBadRequest());
        }
}
