package com.hatchloom.connecthub.connecthub_service.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.hatchloom.connecthub.connecthub_service.client.LaunchPadClient;
import com.hatchloom.connecthub.connecthub_service.dto.ClassifiedPostCreationRequest;
import com.hatchloom.connecthub.connecthub_service.dto.CursorResponse;
import com.hatchloom.connecthub.connecthub_service.enums.ApplicationStatus;
import com.hatchloom.connecthub.connecthub_service.model.ClassifiedPost;
import com.hatchloom.connecthub.connecthub_service.model.ClassifiedPostApplication;
import com.hatchloom.connecthub.connecthub_service.observer.ClassifiedPostFeed;
import com.hatchloom.connecthub.connecthub_service.repository.ClassifiedPostApplicationRepository;
import com.hatchloom.connecthub.connecthub_service.repository.ClassifiedPostRepository;
import com.hatchloom.connecthub.connecthub_service.utils.ClassifiedCursorPayload;
import com.hatchloom.connecthub.connecthub_service.utils.CursorPaginationCodec;
import com.hatchloom.connecthub.connecthub_service.dto.CursorPaginationRequest;

/**
 * Service class for managing classified posts, including creation,
 * retrieval, status updates, and cursor-based pagination
 */
@Service
public class ClassifiedPostService {
    private final ClassifiedPostRepository classifiedPostRepository;
    private final ClassifiedPostFeed classifiedPostFeed;
    private final CursorPaginationService cursorPaginationService;
    private final ClassifiedPostApplicationRepository classifiedPostApplicationRepository;
    private final LaunchPadClient launchPadClient;

    public ClassifiedPostService(ClassifiedPostRepository classifiedPostRepository,
            ClassifiedPostFeed classifiedPostFeed, CursorPaginationService cursorPaginationService,
            ClassifiedPostApplicationRepository classifiedPostApplicationRepository, LaunchPadClient launchPadClient) {
        this.classifiedPostRepository = classifiedPostRepository;
        this.classifiedPostFeed = classifiedPostFeed;
        this.cursorPaginationService = cursorPaginationService;
        this.classifiedPostApplicationRepository = classifiedPostApplicationRepository;
        this.launchPadClient = launchPadClient;
    }

    /**
     * Creates a new classified post based on the provided request
     * 
     * @param request the incoming request containing the details
     * @return the created ClassifiedPost entity
     */
    public ClassifiedPost createClassifiedPost(ClassifiedPostCreationRequest request, UUID authorId) {
        if (validateClassifiedRequest(request, authorId)) {
            throw new IllegalArgumentException("Invalid classified post creation request");
        }

        if (request.positionId() != null) {
            String positionStatus = launchPadClient.getPositionStatus(request.positionId());
            if (!"OPEN".equalsIgnoreCase(positionStatus)) {
                throw new IllegalArgumentException(
                        "Cannot create a classified post for position " + request.positionId()
                                + ": position status is " + positionStatus);
            }
            if (classifiedPostRepository.existsByPositionId(request.positionId())) {
                throw new IllegalArgumentException(
                        "A classified post already exists for position " + request.positionId());
            }
        }

        ClassifiedPost post = new ClassifiedPost();
        post.setTitle(request.basePost().title());
        post.setContent(request.basePost().content());
        post.setAuthor(authorId);
        post.setProjectId(request.projectId());
        post.setPositionId(request.positionId());
        post.setStatus(request.status());

        ClassifiedPost savedPost = classifiedPostRepository.save(post);
        classifiedPostFeed.notifyObservers(savedPost, authorId);
        return savedPost;
    }

    /**
     * Retrieves a classified post by its ID
     * 
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
     * Retrieves the classified post linked to a specific LaunchPad position, if one
     * exists.
     * Returns an empty Optional when no classified has been posted for that
     * position yet.
     *
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
     * 
     * @param status the status to filter by
     * @return a list of classified posts with the status
     */
    public List<ClassifiedPost> filterClassifiedPostsByStatus(String status) {
        if (validateStatus(status)) {
            throw new IllegalArgumentException("Status must be 'open', 'filled', or 'closed'");
        }

        String normalizedStatus = status.trim().toLowerCase();
        return classifiedPostRepository.findByStatus(normalizedStatus);
    }

    /**
     * Validates the status input to ensure it is either "open", "filled", or
     * "closed"
     * 
     * @param status the status string to validate
     * @return a boolean whether the status is valid or not
     */
    private boolean validateStatus(String status) {
        return status == null || (!status.equals("open") && !status.equals("filled") && !status.equals("closed"));
    }

    /**
     * Validates the post ID and user ID parameters
     * 
     * @param postId the post ID to validate
     * @param userId the user ID to validate
     */
    private void validatePostParams(Integer postId, UUID userId) {
        if (postId == null) {
            throw new IllegalArgumentException("Post ID must not be null");
        }

        if (userId == null) {
            throw new IllegalArgumentException("User ID must not be null");
        }

    }

    /**
     * Updates the status of a classified post
     * 
     * @param postId    the post ID of the classified post to update
     * @param userId    The user ID of the author
     * @param newStatus the new status to set
     * @return the updated ClassifiedPost entity
     */
    public ClassifiedPost updateClassifiedPostStatus(Integer postId, UUID userId, String newStatus) {
        validatePostParams(postId, userId);

        ClassifiedPost post = classifiedPostRepository.getClassifiedPostById(postId)
                .orElseThrow(() -> new IllegalArgumentException("Post with ID " + postId + " does not exist"));

        if (!post.getAuthor().equals(userId)) {
            throw new IllegalArgumentException("Only the author can update the post status");
        }

        post.setStatus(newStatus);
        return classifiedPostRepository.save(post);
    }

    /**
     * Retrieves all classified posts with cursor-based pagination, filtered by
     * status
     * 
     * @param after  the cursor indicating the next start point for pagination
     * @param limit  the max number of posts to return
     * @param status the status to filter by
     * @return a CursorResponse containing the paginated list of classified posts
     */
    public CursorResponse<ClassifiedPost> getAllClassifiedPosts(String after, Integer limit, String status) {
        if (validateStatus(status)) {
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

    /**
     * Allows a user to apply to an open classified post
     * 
     * @param postId The post ID they want to apply to
     * @param userId the user ID of the applicant
     */
    public void applyToClassifiedPost(Integer postId, UUID userId) {
        validatePostParams(postId, userId);

        ClassifiedPost post = classifiedPostRepository.getClassifiedPostById(postId)
                .orElseThrow(() -> new IllegalArgumentException("Post with ID " + postId + " does not exist"));
        if (!"open".equalsIgnoreCase(post.getStatus())) {
            throw new IllegalArgumentException("Cannot apply to a post that is not open");
        }

        if (post.getAuthor().equals(userId)) {
            throw new IllegalArgumentException("Authors cannot apply to their own posts");
        }

        boolean alreadyApplied = classifiedPostApplicationRepository
                .existsClassifiedPostApplicationByApplicantIdAndClassifiedPostId(userId, postId);
        if (alreadyApplied) {
            throw new IllegalArgumentException("User has already applied to this post");
        }

        ClassifiedPostApplication application = new ClassifiedPostApplication();
        application.setClassifiedPost(post);
        application.setStatus(ApplicationStatus.APPLIED);
        application.setApplicantId(userId);
        classifiedPostApplicationRepository.save(application);
    }

    /**
     * Validates the classified post creation request
     * 
     * @param request the incoming request
     * @return a boolean indicating whether or not the request is valid
     */
    private boolean validateClassifiedRequest(ClassifiedPostCreationRequest request, UUID authorId) {
        if (request == null) {
            throw new IllegalArgumentException("Request must not be null");
        }

        if (request.basePost().title() == null || request.basePost().title().trim().isEmpty()) {
            throw new IllegalArgumentException("Title must not be null or empty");
        }
        if (request.basePost().content() == null || request.basePost().content().trim().isEmpty()) {
            throw new IllegalArgumentException("Content must not be null or empty");
        }

        if (authorId == null) {
            throw new IllegalArgumentException("Author ID must not be null");
        }

        if (request.projectId() == null) {
            throw new IllegalArgumentException("Project ID must not be null");
        }

        if (request.basePost().title().length() > 255) {
            throw new IllegalArgumentException("Title must not exceed 255 characters");
        }
        if (request.basePost().content().length() > 3000) {
            throw new IllegalArgumentException("Content must not exceed 3000 characters");
        }

        if (validateStatus(request.status())) {
            throw new IllegalArgumentException("Status must be 'open', 'filled', or 'closed'");
        }

        return false;
    }

    /**
     * Retrieves all applications for a specific classified post
     * 
     * @param postId the post ID of the classified post to retrieve applications for
     * @param userId the user ID of the author requesting the applications
     * @return a list of ClassifiedPostApplications
     */
    public List<ClassifiedPostApplication> getApplicationsForClassifiedPost(Integer postId, UUID userId) {
        validatePostParams(postId, userId);

        ClassifiedPost post = classifiedPostRepository.getClassifiedPostById(postId)
                .orElseThrow(() -> new IllegalArgumentException("Post with ID " + postId + " does not exist"));

        if (!post.getAuthor().equals(userId)) {
            throw new IllegalArgumentException("Only the author can view applications for this post");
        }

        return classifiedPostApplicationRepository.findByClassifiedPostId(postId);
    }

    /**
     * Retrieves all classified posts that a user has applied to
     * 
     * @param userId the user ID of the applicant
     * @return a list of classified posts that the user has applied to
     */
    public List<ClassifiedPost> getAppliedClassifiedPostsByUser(UUID userId) {
        if (userId == null) {
            throw new IllegalArgumentException("User ID must not be null");
        }

        List<ClassifiedPostApplication> applications = classifiedPostApplicationRepository
                .findByApplicantIdOrderByAppliedAtDesc(userId);
        return applications.stream().map(ClassifiedPostApplication::getClassifiedPost).toList();
    }

    /**
     * Counts the total number of applications across all classified posts authored
     * by a specific user
     * 
     * @param authorId the user ID of the author
     * @return the total number of applications for the author's posts
     */
    public Integer getTotalApplicationsForAuthor(UUID authorId) {
        if (authorId == null) {
            throw new IllegalArgumentException("Author ID must not be null");
        }

        return classifiedPostApplicationRepository.countByPostAuthorId(authorId);
    }
}
