package com.hatchloom.connecthub.connecthub_service.service;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;

import com.hatchloom.connecthub.connecthub_service.dto.LikeRequest;
import com.hatchloom.connecthub.connecthub_service.enums.ActionType;
import com.hatchloom.connecthub.connecthub_service.model.FeedAction;
import com.hatchloom.connecthub.connecthub_service.model.Post;
import com.hatchloom.connecthub.connecthub_service.model.SharePost;
import com.hatchloom.connecthub.connecthub_service.repository.FeedActionRepository;
import com.hatchloom.connecthub.connecthub_service.repository.FeedPostRepository;

@ExtendWith(MockitoExtension.class)
class FeedActionServiceUnitTest {

    @Mock
    private FeedActionRepository feedActionRepository;

    @Mock
    private FeedPostRepository feedPostRepository;

    @InjectMocks
    private FeedActionService feedActionService;

    @Test
    void likePost_whenPostExistsAndNotLiked_savesLike() {
        UUID userId = UUID.randomUUID();
        Integer postId = 10;
        LikeRequest request = new LikeRequest(postId);
        Post post = new SharePost("title", "content", UUID.randomUUID());

        when(feedPostRepository.getPostById(postId)).thenReturn(post);
        when(feedActionRepository.findByPostIdAndUserIdAndActionType(postId, userId, ActionType.LIKE.getValue()))
                .thenReturn(Optional.empty());

        feedActionService.likePost(request, userId);

        verify(feedActionRepository).save(any(FeedAction.class));
    }

    @Test
    void likePost_whenPostDoesNotExist_throwsIllegalArgumentException() {
        UUID userId = UUID.randomUUID();
        Integer postId = 11;
        LikeRequest request = new LikeRequest(postId);

        when(feedPostRepository.getPostById(postId)).thenReturn(null);

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> feedActionService.likePost(request, userId));

        assertEquals("Post with ID 11 not found", ex.getMessage());
    }

    @Test
    void unlikePost_whenNotPreviouslyLiked_throwsIllegalArgumentException() {
        UUID userId = UUID.randomUUID();
        Integer postId = 12;

        when(feedActionRepository.findByPostIdAndUserIdAndActionType(postId, userId, ActionType.LIKE.getValue()))
                .thenReturn(Optional.empty());

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> feedActionService.unlikePost(postId, userId));

        assertEquals("User has not liked this post", ex.getMessage());
    }
}
