package com.hatchloom.connecthub.connecthub_service.controller;

import com.hatchloom.connecthub.connecthub_service.dto.ConversationResponse;
import com.hatchloom.connecthub.connecthub_service.dto.MessageResponse;
import com.hatchloom.connecthub.connecthub_service.dto.SendMessageRequest;
import com.hatchloom.connecthub.connecthub_service.dto.SendMessageResponse;
import com.hatchloom.connecthub.connecthub_service.service.MessageService;
import com.hatchloom.connecthub.connecthub_service.utils.JwtUtil;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * REST controller for managing messages, including sending messages and retrieving conversation messages.
 */
@RestController
@RequestMapping("/api/message")
public class MessageController {
    private final MessageService messageService;
    private final JwtUtil jwtUtil;

    public MessageController(MessageService messageService, JwtUtil jwtUtil) {
        this.messageService = messageService;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/{recipientId}/send")
    public ResponseEntity<SendMessageResponse> sendMessage(@RequestHeader("Authorization") String authHeader, @PathVariable UUID recipientId, @RequestBody SendMessageRequest request) {
        try {
            UUID senderId = jwtUtil.extractUserId(authHeader);
            SendMessageResponse response = messageService.sendMessage(request.conversationId(), senderId, recipientId, request.content());
            return new ResponseEntity<>(response, HttpStatus.CREATED);
        }
        catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }

    @GetMapping("/conversation/")
    public ResponseEntity<List<ConversationResponse>> getUserConversations(@RequestHeader("Authorization") String authHeader) {
        try {
            UUID userId = jwtUtil.extractUserId(authHeader);
            List<ConversationResponse> conversations = messageService.getUserConversations(userId);
            return new ResponseEntity<>(conversations, HttpStatus.OK);
        }
        catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }

    @GetMapping("/conversation/{conversationId}")
    public ResponseEntity<List<MessageResponse>> getConversationMessages(@PathVariable UUID conversationId, @RequestHeader("Authorization") String authHeader) {
        try {
            UUID userId = jwtUtil.extractUserId(authHeader);
            List<MessageResponse> msgs = messageService.getConversationMessages(conversationId, userId);
            return new ResponseEntity<>(msgs, HttpStatus.OK);
        }
        catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }
}
