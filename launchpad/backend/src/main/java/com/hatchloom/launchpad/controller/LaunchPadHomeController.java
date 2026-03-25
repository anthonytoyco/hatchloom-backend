package com.hatchloom.launchpad.controller;

import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.hatchloom.launchpad.aggregator.LaunchPadAggregator;
import com.hatchloom.launchpad.aggregator.dto.LaunchPadHomeView;

import io.swagger.v3.oas.annotations.tags.Tag;

/**
 * Controller for the LaunchPad home aggregation endpoint.
 *
 * <p>
 * Delegates entirely to {@link LaunchPadAggregator} (Facade pattern) to compose
 * the home view from Sandbox and SideHustle data.
 * </p>
 */
@RestController
@RequestMapping("/launchpad/home")
@Tag(name = "LaunchPad Home")
public class LaunchPadHomeController {

    private final LaunchPadAggregator aggregator;

    public LaunchPadHomeController(LaunchPadAggregator aggregator) {
        this.aggregator = aggregator;
    }

    /**
     * Returns the aggregated LaunchPad home view for a student.
     *
     * @param userId the student's UUID
     * @return 200 OK with {@link LaunchPadHomeView}
     */
    @GetMapping("/{userId}")
    public ResponseEntity<LaunchPadHomeView> getHome(@PathVariable UUID userId) {
        return ResponseEntity.ok(aggregator.getHomeView(userId));
    }
}
