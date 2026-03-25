package com.hatchloom.launchpad.aggregator;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.hatchloom.launchpad.aggregator.dto.LaunchPadHomeView;
import com.hatchloom.launchpad.aggregator.dto.SandboxSummary;
import com.hatchloom.launchpad.aggregator.dto.SideHustleSummary;
import com.hatchloom.launchpad.dto.response.SandboxResponse;
import com.hatchloom.launchpad.dto.response.SideHustleResponse;
import com.hatchloom.launchpad.model.enums.SideHustleStatus;
import com.hatchloom.launchpad.service.SandboxService;
import com.hatchloom.launchpad.service.SideHustleService;

/**
 * Facade aggregator for the LaunchPad home view.
 *
 * <p>
 * Implements the Facade pattern: provides a single unified interface
 * ({@link #getHomeView(UUID)}) over the Sandbox and SideHustle modules to
 * compose the home view counts and summaries. Does not persist any data and
 * does not access repositories directly - it delegates entirely to the
 * service layer.
 * </p>
 *
 * <p>
 * Design Doc reference: §4.1 Aggregator component (component diagram p. 18),
 * sequence diagram p. 14, TC-Q2-004.
 * </p>
 */
@Service
public class LaunchPadAggregator {

        private final SandboxService sandboxService;
        private final SideHustleService sideHustleService;

        public LaunchPadAggregator(SandboxService sandboxService,
                        SideHustleService sideHustleService) {
                this.sandboxService = sandboxService;
                this.sideHustleService = sideHustleService;
        }

        /**
         * Composes and returns the LaunchPad home view for a student.
         *
         * <p>
         * Reads from the Sandbox and SideHustle service layers only - no direct
         * DB writes or repository calls. Counts are derived from the returned lists
         * so they always stay in sync.
         * </p>
         *
         * @param studentId the student's UUID
         * @return the assembled {@link LaunchPadHomeView}
         */
        @Transactional(readOnly = true)
        public LaunchPadHomeView getHomeView(UUID studentId) {
                List<SandboxResponse> sandboxes = sandboxService.listByStudent(studentId);
                List<SideHustleResponse> sideHustles = sideHustleService.listByStudent(studentId);

                int inTheLabCount = sandboxes.size();
                int liveVenturesCount = (int) sideHustles.stream()
                                .filter(s -> s.getStatus() == SideHustleStatus.LIVE_VENTURE)
                                .count();

                List<SandboxSummary> sandboxSummaries = sandboxes.stream()
                                .map(SandboxSummary::from)
                                .toList();

                List<SideHustleSummary> sideHustleSummaries = sideHustles.stream()
                                .map(SideHustleSummary::from)
                                .toList();

                return new LaunchPadHomeView(inTheLabCount, liveVenturesCount,
                                sandboxSummaries, sideHustleSummaries);
        }
}
