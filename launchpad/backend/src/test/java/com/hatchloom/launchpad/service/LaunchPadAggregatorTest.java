package com.hatchloom.launchpad.service;

import java.util.Collections;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;

import com.hatchloom.launchpad.aggregator.LaunchPadAggregator;
import com.hatchloom.launchpad.aggregator.dto.LaunchPadHomeView;
import com.hatchloom.launchpad.dto.response.SandboxResponse;
import com.hatchloom.launchpad.dto.response.SideHustleResponse;
import com.hatchloom.launchpad.model.Sandbox;
import com.hatchloom.launchpad.model.SideHustle;
import com.hatchloom.launchpad.model.enums.SideHustleStatus;

/**
 * TC-Q2-004 - LaunchPad Home Summary Counts (Aggregator / Facade Pattern)
 *
 * <p>
 * Requirements Coverage: HL-LaunchPad-Home-Counts
 * </p>
 *
 * <p>
 * Verifies that {@link LaunchPadAggregator#getHomeView(UUID)} correctly
 * computes
 * {@code inTheLabCount}, {@code liveVenturesCount}, and assembles sandbox and
 * sideHustle
 * summaries without persisting any data. Delegates entirely to the service
 * layer.
 * </p>
 */
@ExtendWith(MockitoExtension.class)
class LaunchPadAggregatorTest {

    @Mock
    private SandboxService sandboxService;
    @Mock
    private SideHustleService sideHustleService;

    @InjectMocks
    private LaunchPadAggregator aggregator;

    /**
     * TC-Q2-004 main path: 2 sandboxes + 1 LIVE_VENTURE (with open position) + 1
     * IN_THE_LAB.
     * Expected: inTheLabCount = 2, liveVenturesCount = 1, list sizes correct.
     */
    @Test
    void getHomeView_twoSandboxesOneLiveVenture_returnsCorrectCounts() {
        UUID studentId = UUID.randomUUID();

        Sandbox sb1 = sandboxWithTitle("Sandbox Alpha");
        Sandbox sb2 = sandboxWithTitle("Sandbox Beta");
        when(sandboxService.listByStudent(studentId))
                .thenReturn(List.of(SandboxResponse.from(sb1), SandboxResponse.from(sb2)));

        SideHustle liveVenture = sideHustleWith("Live Hustle", SideHustleStatus.LIVE_VENTURE, true);
        SideHustle inTheLab = sideHustleWith("Lab Hustle", SideHustleStatus.IN_THE_LAB, false);
        when(sideHustleService.listByStudent(studentId))
                .thenReturn(List.of(SideHustleResponse.from(liveVenture), SideHustleResponse.from(inTheLab)));

        LaunchPadHomeView view = aggregator.getHomeView(studentId);

        assertEquals(2, view.getInTheLabCount());
        assertEquals(1, view.getLiveVenturesCount());
        assertEquals(2, view.getSandboxes().size());
        assertEquals(2, view.getSideHustles().size());
        // The live venture has hasOpenPositions = true
        assertTrue(view.getSideHustles().stream().anyMatch(s -> s.isHasOpenPositions()));
    }

    /**
     * With no data, all counts are zero and lists are empty.
     */
    @Test
    void getHomeView_noData_returnsZeroCountsAndEmptyLists() {
        UUID studentId = UUID.randomUUID();
        when(sandboxService.listByStudent(studentId)).thenReturn(Collections.emptyList());
        when(sideHustleService.listByStudent(studentId)).thenReturn(Collections.emptyList());

        LaunchPadHomeView view = aggregator.getHomeView(studentId);

        assertEquals(0, view.getInTheLabCount());
        assertEquals(0, view.getLiveVenturesCount());
        assertTrue(view.getSandboxes().isEmpty());
        assertTrue(view.getSideHustles().isEmpty());
    }

    /**
     * IN_THE_LAB SideHustles must not increment liveVenturesCount.
     */
    @Test
    void getHomeView_allInTheLab_liveVenturesCountIsZero() {
        UUID studentId = UUID.randomUUID();
        when(sandboxService.listByStudent(studentId)).thenReturn(Collections.emptyList());

        SideHustle lab1 = sideHustleWith("Lab 1", SideHustleStatus.IN_THE_LAB, false);
        SideHustle lab2 = sideHustleWith("Lab 2", SideHustleStatus.IN_THE_LAB, false);
        when(sideHustleService.listByStudent(studentId))
                .thenReturn(List.of(SideHustleResponse.from(lab1), SideHustleResponse.from(lab2)));

        LaunchPadHomeView view = aggregator.getHomeView(studentId);

        assertEquals(0, view.getLiveVenturesCount());
        assertEquals(2, view.getSideHustles().size());
    }

    // ---- helpers ----

    private Sandbox sandboxWithTitle(String title) {
        Sandbox sb = new Sandbox();
        sb.setStudentId(UUID.randomUUID());
        sb.setTitle(title);
        return sb;
    }

    private SideHustle sideHustleWith(String title, SideHustleStatus status, boolean hasOpenPositions) {
        SideHustle sh = new SideHustle();
        sh.setStudentId(UUID.randomUUID());
        sh.setTitle(title);
        sh.setStatus(status);
        sh.setHasOpenPositions(hasOpenPositions);
        return sh;
    }
}
