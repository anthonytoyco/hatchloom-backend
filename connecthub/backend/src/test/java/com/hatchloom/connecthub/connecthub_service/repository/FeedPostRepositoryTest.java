package com.hatchloom.connecthub.connecthub_service.repository;

import java.util.List;
import java.time.LocalDateTime;

import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.data.domain.PageRequest;

import com.hatchloom.connecthub.connecthub_service.model.Post;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@Tag("integration")
class FeedPostRepositoryTest {

    @Autowired
    private FeedPostRepository feedPostRepository;

    @Test
    void findById_whenMissing_returnsEmpty() {
        assertThat(feedPostRepository.findById(999_999)).isEmpty();
    }

    @Test
    void findAllByOrderByCreatedAtDescIdDesc_whenNoPosts_returnsEmpty() {
        List<Post> posts = feedPostRepository.findAllByOrderByCreatedAtDescIdDesc(PageRequest.of(0, 10));

        assertThat(posts).isEmpty();
    }

    @Test
    void findAllWithCursor_whenNoPosts_returnsEmpty() {
        List<Post> posts = feedPostRepository.findAllWithCursor(
                LocalDateTime.now(),
                Integer.MAX_VALUE,
                PageRequest.of(0, 10));

        assertThat(posts).isEmpty();
    }
}
