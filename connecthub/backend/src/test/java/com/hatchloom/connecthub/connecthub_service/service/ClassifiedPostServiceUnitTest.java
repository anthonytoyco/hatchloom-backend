package com.hatchloom.connecthub.connecthub_service.service;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;

import com.hatchloom.connecthub.connecthub_service.utils.ClassifiedPostValidators;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.hatchloom.connecthub.connecthub_service.client.LaunchPadClient;
import com.hatchloom.connecthub.connecthub_service.dto.BasePostRequest;
import com.hatchloom.connecthub.connecthub_service.dto.ClassifiedPostCreationRequest;
import com.hatchloom.connecthub.connecthub_service.model.ClassifiedPost;
import com.hatchloom.connecthub.connecthub_service.observer.ClassifiedPostFeed;
import com.hatchloom.connecthub.connecthub_service.repository.ClassifiedPostApplicationRepository;
import com.hatchloom.connecthub.connecthub_service.repository.ClassifiedPostRepository;

@ExtendWith(MockitoExtension.class)
class ClassifiedPostServiceUnitTest {

        @Mock
        private ClassifiedPostRepository classifiedPostRepository;

        @Mock
        private ClassifiedPostFeed classifiedPostFeed;

        @Mock
        private CursorPaginationService cursorPaginationService;

        @Mock
        private ClassifiedPostApplicationRepository classifiedPostApplicationRepository;

        @Mock
        private ClassifiedPostValidators classifiedPostValidators;

        @Mock
        private LaunchPadClient launchPadClient;

        @InjectMocks
        private ClassifiedPostService classifiedPostService;

        @InjectMocks
        private ClassifiedPostQueryService classifiedPostQueryService;

        @Test
        void createClassifiedPost_validRequest_savesAndNotifies() {
                UUID authorId = UUID.randomUUID();
                UUID projectId = UUID.randomUUID();
                ClassifiedPostCreationRequest request = new ClassifiedPostCreationRequest(
                                new BasePostRequest("Looking for dev", "Project details"),
                                projectId,
                                null,
                                "open");

                when(classifiedPostRepository.save(any(ClassifiedPost.class)))
                                .thenAnswer(invocation -> invocation.getArgument(0));

                ClassifiedPost created = classifiedPostService.createClassifiedPost(request, authorId);

                assertNotNull(created);
                assertEquals("Looking for dev", created.getTitle());
                assertEquals(authorId, created.getAuthor());
                verify(classifiedPostFeed).notifyObservers(any(ClassifiedPost.class), any(UUID.class));
        }

        @Test
        void createClassifiedPost_whenAuthorMissing_throwsIllegalArgumentException() {
                ClassifiedPostCreationRequest request = new ClassifiedPostCreationRequest(
                                new BasePostRequest("Title", "Content"),
                                UUID.randomUUID(),
                                null,
                                "open");

                doThrow(new IllegalArgumentException("Author ID must not be null"))
                        .when(classifiedPostValidators).validateClassifiedRequest(eq(request), isNull());

                IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                                () -> classifiedPostService.createClassifiedPost(request, null));

                assertEquals("Author ID must not be null", ex.getMessage());
                verify(classifiedPostRepository, never()).save(any());
        }

        @Test
        void getClassifiedById_whenMissing_throwsIllegalArgumentException() {
                Integer postId = 999;

                when(classifiedPostRepository.existsById(postId)).thenReturn(false);

                IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                                () -> classifiedPostQueryService.getClassifiedById(postId));

                assertEquals("Post with ID 999 does not exist", ex.getMessage());
        }
}
