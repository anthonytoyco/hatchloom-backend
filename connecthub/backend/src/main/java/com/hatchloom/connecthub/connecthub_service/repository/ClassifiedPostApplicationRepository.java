package com.hatchloom.connecthub.connecthub_service.repository;

import com.hatchloom.connecthub.connecthub_service.model.ClassifiedPostApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

/**
 * Repository interface for managing ClassifiedPostApplication entities
 */
public interface ClassifiedPostApplicationRepository extends JpaRepository<ClassifiedPostApplication, Integer> {
    boolean existsClassifiedPostApplicationByApplicantIdAndClassifiedPostId(UUID applicantId, Integer classifiedPostId);
    List<ClassifiedPostApplication> findByClassifiedPostIdOrderByAppliedAtDesc(Integer classifiedPostId);
    List<ClassifiedPostApplication> findByApplicantIdOrderByAppliedAtDesc(UUID applicantId);

    List<ClassifiedPostApplication> findByClassifiedPostId(Integer classifiedPostId);

    @Query("SELECT COUNT(a) FROM ClassifiedPostApplication a WHERE a.classifiedPost.author = :authorId")
    Integer countByPostAuthorId(UUID authorId);
}
