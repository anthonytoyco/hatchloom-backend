package com.hatchloom.connecthub.connecthub_service.repository;

import java.util.List;
import java.util.UUID;

import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;

import com.hatchloom.connecthub.connecthub_service.model.Conversations;
import com.hatchloom.connecthub.connecthub_service.model.Messages;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@Tag("integration")
class MessageRepositoryTest {

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private ConversationRepository conversationRepository;

    @Test
    void saveAndRetrieveConversationMessages_returnsMessagesInOrder() {
        Conversations conversation = new Conversations();
        conversation.setUser1Id(UUID.randomUUID());
        conversation.setUser2Id(UUID.randomUUID());
        conversation = conversationRepository.save(conversation);

        Messages first = new Messages();
        first.setConversation(conversation);
        first.setSenderId(conversation.getUser1Id());
        first.setContent("Hello");
        messageRepository.save(first);

        Messages second = new Messages();
        second.setConversation(conversation);
        second.setSenderId(conversation.getUser2Id());
        second.setContent("Hi there");
        messageRepository.save(second);

        List<Messages> found = messageRepository.findByConversationIdOrderByCreatedAtAsc(conversation.getId());

        assertThat(found).hasSize(2);
        assertThat(found.get(0).getContent()).isEqualTo("Hello");
        assertThat(found.get(1).getContent()).isEqualTo("Hi there");
    }

    @Test
    void findByConversationId_whenNoMessages_returnsEmptyList() {
        Conversations conversation = new Conversations();
        conversation.setUser1Id(UUID.randomUUID());
        conversation.setUser2Id(UUID.randomUUID());
        conversation = conversationRepository.save(conversation);

        List<Messages> found = messageRepository.findByConversationIdOrderByCreatedAtAsc(conversation.getId());

        assertThat(found).isEmpty();
    }
}
