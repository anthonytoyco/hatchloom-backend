package com.hatchloom.connecthub.connecthub_service.service;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertInstanceOf;
import static org.junit.jupiter.api.Assertions.assertThrows;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;

import com.hatchloom.connecthub.connecthub_service.dto.BasePostRequest;
import com.hatchloom.connecthub.connecthub_service.dto.PostCreationRequest;
import com.hatchloom.connecthub.connecthub_service.model.Post;
import com.hatchloom.connecthub.connecthub_service.model.SharePost;
import com.hatchloom.connecthub.connecthub_service.repository.FeedPostRepository;

@ExtendWith(MockitoExtension.class)
class FeedPostServiceUnitTest {

    @Mock
    private FeedPostRepository feedPostRepository;

    @Mock
    private CursorPaginationService cursorPaginationService;

    @InjectMocks
    private FeedPostService feedPostService;

    @Test
    void createFeedPost_validShareRequest_savesPost() {
        UUID authorId = UUID.randomUUID();
        PostCreationRequest request = new PostCreationRequest(new BasePostRequest("Title", "Content"), "share");

        when(feedPostRepository.save(any(Post.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Post created = feedPostService.createFeedPost(request, authorId);

        assertInstanceOf(SharePost.class, created);
        assertEquals(authorId, created.getAuthor());
        assertEquals("Title", created.getTitle());
        verify(feedPostRepository).save(any(Post.class));
    }

    @Test
    void createFeedPost_missingAuthor_throwsIllegalArgumentException() {
        PostCreationRequest request = new PostCreationRequest(new BasePostRequest("Title", "Content"), "share");

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> feedPostService.createFeedPost(request, null));

        assertEquals("Author ID must not be null", ex.getMessage());
    }

    @Test
    void deleteFeedPost_notFound_throwsIllegalArgumentException() {
        UUID userId = UUID.randomUUID();
        Integer postId = 123;

        when(feedPostRepository.findById(postId)).thenReturn(Optional.empty());

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> feedPostService.deleteFeedPost(postId, userId));

        assertEquals("Post with ID 123 does not exist", ex.getMessage());
    }
}
