package com.hatchloom.connecthub.connecthub_service.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;

import com.hatchloom.connecthub.connecthub_service.dto.MessageResponse;
import com.hatchloom.connecthub.connecthub_service.dto.SendMessageResponse;
import com.hatchloom.connecthub.connecthub_service.model.Conversations;
import com.hatchloom.connecthub.connecthub_service.model.Messages;
import com.hatchloom.connecthub.connecthub_service.observer.MessageNotificationObserver;
import com.hatchloom.connecthub.connecthub_service.repository.ConversationRepository;
import com.hatchloom.connecthub.connecthub_service.repository.MessageRepository;

@ExtendWith(MockitoExtension.class)
class MessageServiceUnitTest {

    @Mock
    private MessageNotificationObserver messageNotificationObserver;

    @Mock
    private MessageRepository messageRepository;

    @Mock
    private ConversationRepository conversationRepository;

    @InjectMocks
    private MessageService messageService;

    @Test
    void sendMessage_validInputs_savesMessageAndReturnsResponse() {
        UUID senderId = UUID.randomUUID();
        UUID recipientId = UUID.randomUUID();
        UUID conversationId = UUID.randomUUID();

        UUID lesserId = senderId.compareTo(recipientId) <= 0 ? senderId : recipientId;
        UUID greaterId = senderId.compareTo(recipientId) <= 0 ? recipientId : senderId;

        Conversations conversation = new Conversations();
        conversation.setId(conversationId);
        conversation.setUser1Id(lesserId);
        conversation.setUser2Id(greaterId);

        Messages saved = new Messages();
        saved.setId(UUID.randomUUID());
        saved.setConversation(conversation);
        saved.setSenderId(senderId);
        saved.setContent("hello");
        saved.setCreatedAt(LocalDateTime.now());

        when(conversationRepository.findById(conversationId)).thenReturn(Optional.of(conversation));
        when(messageRepository.save(any(Messages.class))).thenReturn(saved);

        SendMessageResponse response = messageService.sendMessage(conversationId, senderId, recipientId, "hello");

        assertEquals(conversationId, response.conversationId());
        assertEquals(senderId, response.senderId());
        assertEquals(recipientId, response.recipientId());
        verify(messageNotificationObserver).update(saved, recipientId);
    }

    @Test
    void sendMessage_whenInputsInvalid_throwsIllegalArgumentException() {
        UUID userId = UUID.randomUUID();

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> messageService.sendMessage(null, userId, userId, "hello"));

        assertEquals("Invalid input: senderId, recipientId, and content must be provided.", ex.getMessage());
    }

    @Test
    void getConversationMessages_whenNoMessages_returnsEmptyList() {
        UUID user1 = UUID.randomUUID();
        UUID user2 = UUID.randomUUID();
        UUID conversationId = UUID.randomUUID();

        UUID lesserId = user1.compareTo(user2) <= 0 ? user1 : user2;
        UUID greaterId = user1.compareTo(user2) <= 0 ? user2 : user1;

        Conversations conversation = new Conversations();
        conversation.setId(conversationId);
        conversation.setUser1Id(lesserId);
        conversation.setUser2Id(greaterId);

        when(conversationRepository.findById(conversationId)).thenReturn(Optional.of(conversation));
        when(messageRepository.findByConversationIdOrderByCreatedAtAsc(conversationId)).thenReturn(List.of());

        List<MessageResponse> messages = messageService.getConversationMessages(conversationId, user1);

        assertEquals(0, messages.size());
    }
}
