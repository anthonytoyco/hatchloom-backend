package com.hatchloom.connecthub.connecthub_service.repository;

import com.hatchloom.connecthub.connecthub_service.model.Messages;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

/**
 * Repository interface for managing Messages entities
 */
public interface MessageRepository extends JpaRepository<Messages, UUID> {
    @Query("SELECT m FROM Messages m WHERE m.conversation.id = :conversationId ORDER BY m.createdAt ASC")
    List<Messages> findByConversationIdOrderByCreatedAtAsc(UUID conversationId);
}
