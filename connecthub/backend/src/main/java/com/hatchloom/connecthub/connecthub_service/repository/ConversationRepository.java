package com.hatchloom.connecthub.connecthub_service.repository;

import com.hatchloom.connecthub.connecthub_service.model.Conversations;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository interface for managing Conversations entities
 */
public interface ConversationRepository extends JpaRepository<Conversations, UUID> {
    Optional<Conversations> findByUser1IdAndUser2Id(UUID user1Id, UUID user2Id);

    @Query("SELECT c FROM Conversations c WHERE c.user1Id = :userId OR c.user2Id = :userId ORDER BY c.createdAt DESC")
    List<Conversations> findConversationsByUserId(@Param("userId") UUID userId);
}
