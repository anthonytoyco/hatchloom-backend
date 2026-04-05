package com.hatchloom.connecthub.connecthub_service.service;

import com.hatchloom.connecthub.connecthub_service.enums.ApplicationStatus;
import com.hatchloom.connecthub.connecthub_service.model.ClassifiedPost;
import com.hatchloom.connecthub.connecthub_service.model.ClassifiedPostApplication;
import com.hatchloom.connecthub.connecthub_service.repository.ClassifiedPostApplicationRepository;
import com.hatchloom.connecthub.connecthub_service.repository.ClassifiedPostRepository;
import com.hatchloom.connecthub.connecthub_service.utils.ClassifiedPostValidators;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class ClassifiedPostApplicationService {
    private final ClassifiedPostRepository classifiedPostRepository;
    private final ClassifiedPostApplicationRepository classifiedPostApplicationRepository;
    private final ClassifiedPostValidators classifiedPostValidators;

    public ClassifiedPostApplicationService(ClassifiedPostRepository classifiedPostRepository,
                                            ClassifiedPostApplicationRepository classifiedPostApplicationRepository,
                                            ClassifiedPostValidators classifiedPostValidators) {
        this.classifiedPostRepository = classifiedPostRepository;
        this.classifiedPostApplicationRepository = classifiedPostApplicationRepository;
        this.classifiedPostValidators = classifiedPostValidators;
    }

    /**
     * Allows a user to apply to an open classified post
     *
     * @param postId The post ID they want to apply to
     * @param userId the user ID of the applicant
     */
    public void applyToClassifiedPost(Integer postId, UUID userId) {
        classifiedPostValidators.validatePostParams(postId, userId);

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
     * Retrieves all applications for a specific classified post
     *
     * @param postId the post ID of the classified post to retrieve applications for
     * @param userId the user ID of the author requesting the applications
     * @return a list of ClassifiedPostApplications
     */
    public List<ClassifiedPostApplication> getApplicationsForClassifiedPost(Integer postId, UUID userId) {
        classifiedPostValidators.validatePostParams(postId, userId);

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
