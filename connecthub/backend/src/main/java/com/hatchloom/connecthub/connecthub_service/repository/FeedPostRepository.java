package com.hatchloom.connecthub.connecthub_service.repository;
import com.hatchloom.connecthub.connecthub_service.model.Post;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Repository interface for managing feed posts entities
 */
public interface FeedPostRepository extends JpaRepository<Post, Integer> {
        Post getPostById(Integer id);

        void deletePostById(Integer id);

        List<Post> findAllByOrderByCreatedAtDescIdDesc(Pageable pageable);

        @Query("""
SELECT p FROM Post  p WHERE (p.createdAt < :cursorCreatedAt OR (p.createdAt = :cursorCreatedAt AND p.id < :cursorId)) ORDER BY p.createdAt DESC, p.id DESC
""")
    List<Post> findAllWithCursor(LocalDateTime cursorCreatedAt, Integer cursorId, Pageable pageable);
}
