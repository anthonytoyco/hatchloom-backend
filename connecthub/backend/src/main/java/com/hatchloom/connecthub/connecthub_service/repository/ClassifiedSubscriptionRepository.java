package com.hatchloom.connecthub.connecthub_service.repository;

import com.hatchloom.connecthub.connecthub_service.model.ClassifiedSubscription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

/**
 * Repository interface for managing ClassifiedSubscription entities
 */
public interface ClassifiedSubscriptionRepository extends JpaRepository<ClassifiedSubscription, Integer> {
    @Query("SELECT s.userId FROM ClassifiedSubscription s")
    List<UUID> findAllUserIds();

    boolean existsByUserId(UUID userId);
    void deleteByUserId(UUID userId);
}
