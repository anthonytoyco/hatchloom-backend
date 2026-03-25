package com.hatchloom.connecthub.connecthub_service.service;

import com.hatchloom.connecthub.connecthub_service.dto.ConversationResponse;
import com.hatchloom.connecthub.connecthub_service.dto.MessageResponse;
import com.hatchloom.connecthub.connecthub_service.dto.SendMessageResponse;
import com.hatchloom.connecthub.connecthub_service.model.Conversations;
import com.hatchloom.connecthub.connecthub_service.model.Messages;
import com.hatchloom.connecthub.connecthub_service.observer.MessageNotificationObserver;
import com.hatchloom.connecthub.connecthub_service.repository.ConversationRepository;
import com.hatchloom.connecthub.connecthub_service.repository.MessageRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Service class for handling message functionality
 */
@Service
public class MessageService {
    private final MessageNotificationObserver messageNotificationObserver;
    private final MessageRepository messageRepository;
    private final ConversationRepository conversationRepository;

    public MessageService(MessageNotificationObserver messageNotificationObserver,
                          MessageRepository messageRepository,
                          ConversationRepository conversationRepository) {
        this.messageNotificationObserver = messageNotificationObserver;
        this.messageRepository = messageRepository;
        this.conversationRepository = conversationRepository;
    }

    /**
     * Sends a message from sender to the recipient
     * @param conversationId the conversation ID
     * @param senderId the sender's user ID
     * @param recipientId the recipient's user ID
     * @param content the message text
     * @return a SendMessageResponse containing message details
     */
    @Transactional
    public SendMessageResponse sendMessage(UUID conversationId, UUID senderId, UUID recipientId, String content) {
        if (!validateInputs(senderId, recipientId, content)) {
            throw new IllegalArgumentException("Invalid input: senderId, recipientId, and content must be provided.");
        }

        Conversations c;
        if (conversationId == null) {
            c = getOrCreateConversation(senderId, recipientId);
        }
        else {
            c = conversationRepository.findById(conversationId).orElseThrow(() -> new IllegalArgumentException("Conversation not found with id: " + conversationId));
        }

        UUID lesserId = senderId.compareTo(recipientId) <= 0 ? senderId : recipientId;
        UUID greaterId = senderId.compareTo(recipientId) <= 0 ? recipientId : senderId;

        if (!(c.getUser1Id().equals(lesserId) && c.getUser2Id().equals(greaterId))) {
            throw new IllegalArgumentException("Conversation does not match sender and recipient");
        }

        Messages m = new Messages();
        m.setConversation(c);
        m.setSenderId(senderId);
        m.setContent(content.trim());
        Messages savedMessage = messageRepository.save(m);

        messageNotificationObserver.update(savedMessage, recipientId);
        return new SendMessageResponse(c.getId(), savedMessage.getId(), senderId, recipientId, savedMessage.getContent(), savedMessage.getCreatedAt());
    }

    /**
     * Get an existing conversation between sender and recipient,
     * or create a new one if null
     * @param senderId the sender user ID
     * @param recipientId the recipient user ID
     * @return the existing or newly created Conversations object
     */
    public Conversations getOrCreateConversation(UUID senderId, UUID recipientId) {
        UUID lesserId = senderId.compareTo(recipientId) <= 0 ? senderId : recipientId;
        UUID greaterId = senderId.compareTo(recipientId) <= 0 ? recipientId : senderId;
        Optional<Conversations> c = conversationRepository.findByUser1IdAndUser2Id(lesserId, greaterId);

        if (c.isEmpty()) {
            Conversations conversation = new Conversations();
            conversation.setUser1Id(lesserId);
            conversation.setUser2Id(greaterId);
            return conversationRepository.save(conversation);
        } else {
            return c.get();
        }
    }

    /**
     * Validates the inputs for sending a message
     * @param senderId the sender user ID
     * @param recipientId the recipient user ID
     * @param content the message content
     * @return true if inputs are valid, false otherwise
     */
    public boolean validateInputs(UUID senderId, UUID recipientId, String content) {
        return senderId != null && recipientId != null && !senderId.equals(recipientId) && content != null && !content.trim().isEmpty();
    }

    /**
     * Retrieves all messages in a conversation for a user
     * @param conversationId the conversation ID to fetch
     * @param userId the user ID of the requester
     * @return a list of MessageResponse objects containing message details
     */
    public List<MessageResponse> getConversationMessages(UUID conversationId, UUID userId) {
        Conversations conversation = conversationRepository.findById(conversationId).orElseThrow(() -> new IllegalArgumentException("Conversation not found with id: " + conversationId));

        if (!conversation.getUser1Id().equals(userId) && !conversation.getUser2Id().equals(userId)) {
            throw new IllegalArgumentException("User is not a participant in this conversation");
        }

        List<Messages> messages = messageRepository.findByConversationIdOrderByCreatedAtAsc(conversationId);
        return messages.stream()
                .map(m -> new MessageResponse(m.getId(), m.getConversationId(), m.getSenderId(), m.getContent(), m.getCreatedAt()))
                .collect(Collectors.toList());

    }

    /**
     * Retrieves all conversations for a user
     * @param userId the logged-in user
     * @return a list of Conversations for the user
     */
    public List<ConversationResponse> getUserConversations(UUID userId) {
        if (userId == null) {
            throw new IllegalArgumentException("User ID must be provided");
        }

        List<Conversations> conversations = conversationRepository.findConversationsByUserId(userId);
        return conversations.stream()
                .map(c -> {
                    UUID otherUserId = c.getUser1Id().equals(userId) ? c.getUser2Id() : c.getUser1Id();
                    return new ConversationResponse(c.getId(), otherUserId, c.getCreatedAt());
                })
                .collect(Collectors.toList());
    }
}
