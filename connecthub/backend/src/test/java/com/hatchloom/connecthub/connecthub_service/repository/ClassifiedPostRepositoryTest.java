package com.hatchloom.connecthub.connecthub_service.repository;

import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.data.domain.PageRequest;

import com.hatchloom.connecthub.connecthub_service.enums.ClassifiedStatus;

@DataJpaTest
@Tag("integration")
class ClassifiedPostRepositoryTest {

    @Autowired
    private ClassifiedPostRepository classifiedPostRepository;

    @Test
    void findByPositionId_whenRepositoryEmpty_returnsEmpty() {
        UUID positionId = UUID.randomUUID();

        assertThat(classifiedPostRepository.findByPositionId(positionId)).isEmpty();
        assertThat(classifiedPostRepository.existsByPositionId(positionId)).isFalse();
    }

    @Test
    void findByStatusAndCursor_whenRepositoryEmpty_returnsEmptyLists() {
        List<?> openPosts = classifiedPostRepository
                .findByStatusOrderByCreatedAtDescIdDesc(ClassifiedStatus.OPEN.getStatus(), PageRequest.of(0, 10));

        assertThat(openPosts).isEmpty();

        List<?> openPostsWithCursor = classifiedPostRepository.findByStatusWithCursor(
                ClassifiedStatus.OPEN.getStatus(),
                java.time.LocalDateTime.now(),
                Integer.MAX_VALUE,
                PageRequest.of(0, 10));

        assertThat(openPostsWithCursor).isEmpty();
    }
}