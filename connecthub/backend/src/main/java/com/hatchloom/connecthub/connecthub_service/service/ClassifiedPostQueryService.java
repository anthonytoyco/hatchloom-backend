package com.hatchloom.connecthub.connecthub_service.service;

import com.hatchloom.connecthub.connecthub_service.dto.CursorPaginationRequest;
import com.hatchloom.connecthub.connecthub_service.dto.CursorResponse;
import com.hatchloom.connecthub.connecthub_service.model.ClassifiedPost;
import com.hatchloom.connecthub.connecthub_service.repository.ClassifiedPostRepository;
import com.hatchloom.connecthub.connecthub_service.utils.ClassifiedCursorPayload;
import com.hatchloom.connecthub.connecthub_service.utils.ClassifiedPostValidators;
import com.hatchloom.connecthub.connecthub_service.utils.CursorPaginationCodec;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class ClassifiedPostQueryService {
    private final ClassifiedPostRepository classifiedPostRepository;
    private final CursorPaginationService cursorPaginationService;
    private final ClassifiedPostValidators classifiedPostValidators;

    public ClassifiedPostQueryService(ClassifiedPostRepository classifiedPostRepository, CursorPaginationService cursorPaginationService,
                                      ClassifiedPostValidators classifiedPostValidators) {
        this.classifiedPostRepository = classifiedPostRepository;
        this.cursorPaginationService = cursorPaginationService;
        this.classifiedPostValidators = classifiedPostValidators;
    }

    /**
     * Retrieves a classified post by its ID
     * @param postId the ID of the classified post to retrieve
     * @return the ClassifiedPost entity with the specified ID
     */
    public ClassifiedPost getClassifiedById(Integer postId) {
        if (postId == null) {
            throw new IllegalArgumentException("Post ID must not be null");
        }
        if (postId <= 0) {
            throw new IllegalArgumentException("Post ID must be a positive integer");
        }

        if (!classifiedPostRepository.existsById(postId)) {
            throw new IllegalArgumentException("Post with ID " + postId + " does not exist");
        }
        return classifiedPostRepository.getClassifiedPostById(postId)
                .orElseThrow(() -> new IllegalArgumentException("Post with ID " + postId + " does not exist"));
    }

    /**
     * Retrieves the classified post linked to a specific LaunchPad position, if one exists.
     * Returns an empty Optional when no classified has been posted for that position yet.
     * @param positionId the LaunchPad position UUID
     * @return an Optional containing the classified post, or empty if none exists
     */
    public Optional<ClassifiedPost> getClassifiedByPositionId(UUID positionId) {
        if (positionId == null) {
            throw new IllegalArgumentException("Position ID must not be null");
        }
        return classifiedPostRepository.findByPositionId(positionId);
    }

    /**
     * Filters classified posts based on their status (open, filled, closed)
     * @param status the status to filter by
     * @return a list of classified posts with the status
     */
    public List<ClassifiedPost> filterClassifiedPostsByStatus(String status) {
        if (classifiedPostValidators.validateStatus(status)) {
            throw new IllegalArgumentException("Status must be 'open', 'filled', or 'closed'");
        }

        String normalizedStatus = status.trim().toLowerCase();
        return classifiedPostRepository.findByStatus(normalizedStatus);
    }

    /**
     * Retrieves all classified posts with cursor-based pagination, filtered by status
     * @param after  the cursor indicating the next start point for pagination
     * @param limit  the max number of posts to return
     * @param status the status to filter by
     * @return a CursorResponse containing the paginated list of classified posts
     */
    public CursorResponse<ClassifiedPost> getAllClassifiedPosts(String after, Integer limit, String status) {
        if (classifiedPostValidators.validateStatus(status)) {
            throw new IllegalArgumentException("Status must be 'open', 'filled', or 'closed'");
        }

        return cursorPaginationService.paginate(
                new CursorPaginationRequest<>(
                        after,
                        limit,
                        pageable -> classifiedPostRepository.findByStatusOrderByCreatedAtDescIdDesc(status, pageable),
                        (payload, pageable) -> {
                            LocalDateTime createdAt = LocalDateTime.parse(payload.createdAt());
                            return classifiedPostRepository.findByStatusWithCursor(status, createdAt, payload.id(), pageable);
                        },
                        cursor -> CursorPaginationCodec.decodeCursor(cursor, ClassifiedCursorPayload::new),
                        payload -> CursorPaginationCodec.encodeCursor(payload.id(), payload.createdAt()),
                        post -> new ClassifiedCursorPayload(post.getCreatedAt().toString(), post.getId())
                )
        );
    }



}
