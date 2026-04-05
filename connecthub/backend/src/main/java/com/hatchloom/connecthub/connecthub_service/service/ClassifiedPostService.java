package com.hatchloom.connecthub.connecthub_service.service;
import java.util.UUID;

import com.hatchloom.connecthub.connecthub_service.utils.ClassifiedPostValidators;
import org.springframework.stereotype.Service;
import com.hatchloom.connecthub.connecthub_service.client.LaunchPadClient;
import com.hatchloom.connecthub.connecthub_service.dto.ClassifiedPostCreationRequest;
import com.hatchloom.connecthub.connecthub_service.model.ClassifiedPost;
import com.hatchloom.connecthub.connecthub_service.observer.ClassifiedPostFeed;
import com.hatchloom.connecthub.connecthub_service.repository.ClassifiedPostRepository;

/**
 * Service class for managing classified posts, including creation,
 * retrieval, status updates, and cursor-based pagination
 */
@Service
public class ClassifiedPostService {
    private final ClassifiedPostRepository classifiedPostRepository;
    private final ClassifiedPostFeed classifiedPostFeed;
    private final LaunchPadClient launchPadClient;
    private final ClassifiedPostValidators classifiedPostValidators;

    public ClassifiedPostService(ClassifiedPostRepository classifiedPostRepository,
            ClassifiedPostFeed classifiedPostFeed, LaunchPadClient launchPadClient, ClassifiedPostValidators classifiedPostValidators) {
        this.classifiedPostRepository = classifiedPostRepository;
        this.classifiedPostFeed = classifiedPostFeed;
        this.launchPadClient = launchPadClient;
        this.classifiedPostValidators = classifiedPostValidators;
    }

    /**
     * Creates a new classified post based on the provided request
     * 
     * @param request the incoming request containing the details
     * @return the created ClassifiedPost entity
     */
    public ClassifiedPost createClassifiedPost(ClassifiedPostCreationRequest request, UUID authorId) {
        classifiedPostValidators.validateClassifiedRequest(request, authorId);

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
     * Updates the status of a classified post
     * 
     * @param postId    the post ID of the classified post to update
     * @param userId    The user ID of the author
     * @param newStatus the new status to set
     * @return the updated ClassifiedPost entity
     */
    public ClassifiedPost updateClassifiedPostStatus(Integer postId, UUID userId, String newStatus) {
        classifiedPostValidators.validatePostParams(postId, userId);

        ClassifiedPost post = classifiedPostRepository.getClassifiedPostById(postId)
                .orElseThrow(() -> new IllegalArgumentException("Post with ID " + postId + " does not exist"));

        if (!post.getAuthor().equals(userId)) {
            throw new IllegalArgumentException("Only the author can update the post status");
        }

        post.setStatus(newStatus);
        return classifiedPostRepository.save(post);
    }

}
