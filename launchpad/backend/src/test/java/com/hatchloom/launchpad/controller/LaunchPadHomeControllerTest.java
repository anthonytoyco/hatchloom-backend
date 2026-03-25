package com.hatchloom.launchpad.controller;

import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import com.hatchloom.launchpad.aggregator.LaunchPadAggregator;
import com.hatchloom.launchpad.aggregator.dto.LaunchPadHomeView;

/**
 * Controller-layer unit tests for {@link LaunchPadHomeController}.
 */
@ExtendWith(MockitoExtension.class)
class LaunchPadHomeControllerTest {

    @Mock
    private LaunchPadAggregator aggregator;

    @InjectMocks
    private LaunchPadHomeController controller;

    @Test
    void getHome_delegatesToAggregator_returns200() {
        UUID userId = UUID.randomUUID();
        LaunchPadHomeView view = new LaunchPadHomeView(2, 1, List.of(), List.of());
        when(aggregator.getHomeView(userId)).thenReturn(view);

        ResponseEntity<LaunchPadHomeView> response = controller.getHome(userId);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(2, response.getBody().getInTheLabCount());
        assertEquals(1, response.getBody().getLiveVenturesCount());
        verify(aggregator).getHomeView(userId);
    }
}
