package com.hatchloom.connecthub.connecthub_service.repository;
import com.hatchloom.connecthub.connecthub_service.model.ClassifiedPost;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;


/**
 * Repository interface for managing ClassifiedPost entities
 */
public interface ClassifiedPostRepository extends JpaRepository<ClassifiedPost, Integer> {
    Optional<ClassifiedPost> getClassifiedPostById(Integer id);

    List<ClassifiedPost> findByStatus(String status);

    List<ClassifiedPost> findByStatusOrderByCreatedAtDescIdDesc(String status, Pageable pageable);

    @Query("""
    SELECT c FROM ClassifiedPost c WHERE c.status = :status AND (c.createdAt < :cursorCreatedAt OR (c.createdAt = :cursorCreatedAt AND c.id < :cursorId)) ORDER BY c.createdAt DESC, c.id DESC
""")
    List<ClassifiedPost> findByStatusWithCursor(String status, LocalDateTime cursorCreatedAt, Integer cursorId, Pageable pageable);
}
