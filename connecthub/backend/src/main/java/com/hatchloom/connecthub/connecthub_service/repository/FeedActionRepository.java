package com.hatchloom.connecthub.connecthub_service.repository;

import com.hatchloom.connecthub.connecthub_service.model.FeedAction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository interface for managing feed action entities
 */
public interface FeedActionRepository extends JpaRepository<FeedAction, Integer> {
    FeedAction getFeedActionById(Integer id);

    Optional<FeedAction> findByPostIdAndUserIdAndActionType(Integer postId, UUID userId, String actionType);

    @Query("SELECT fa FROM FeedAction fa WHERE fa.postId = :postId AND fa.actionType = 'comment' ORDER BY fa.createdAt DESC")
    List<FeedAction> findCommentsByPostId(@Param("postId") Integer postId);

    Optional<FeedAction> findByIdAndUserIdAndActionType(Integer id, UUID userId, String actionType);

    @Query("SELECT COUNT(fa) FROM FeedAction fa WHERE fa.postId = :postId AND fa.actionType = 'like'")
    Long countLikesByPostId(@Param("postId") Integer postId);

    @Query("SELECT COUNT(fa) FROM FeedAction fa WHERE fa.postId = :postId AND fa.actionType = 'comment'")
    Long countCommentsByPostId(@Param("postId") Integer postId);

    Optional<FeedAction> findByParentActionIdAndUserIdAndActionType(Integer parentActionId, UUID userId, String actionType);

    @Query("SELECT COUNT(fa) FROM FeedAction fa WHERE fa.parentActionId = :commentId AND fa.actionType = 'like'")
    Long countLikesByCommentId(@Param("commentId") Integer commentId);
}
