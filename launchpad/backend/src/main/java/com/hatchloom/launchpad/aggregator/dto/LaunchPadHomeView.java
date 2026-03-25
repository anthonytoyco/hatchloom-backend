package com.hatchloom.launchpad.aggregator.dto;

import java.util.List;

/**
 * Aggregated home view for the LaunchPad pillar.
 *
 * <p>
 * Assembled by {@link com.hatchloom.launchpad.aggregator.LaunchPadAggregator}
 * from data across the Sandbox and SideHustle modules. Not persisted.
 * </p>
 *
 * <p>
 * Design Doc reference: §4.1 Aggregator component, sequence diagram p. 14.
 * </p>
 */
public class LaunchPadHomeView {

    private final int inTheLabCount;
    private final int liveVenturesCount;
    private final List<SandboxSummary> sandboxes;
    private final List<SideHustleSummary> sideHustles;

    /**
     * Constructs a fully assembled home view.
     *
     * @param inTheLabCount     total number of sandboxes (= "In the Lab" count)
     * @param liveVenturesCount number of SideHustles with status
     *                          {@code LIVE_VENTURE}
     * @param sandboxes         list of sandbox summaries
     * @param sideHustles       list of sideHustle summaries (each with
     *                          open-position flag)
     */
    public LaunchPadHomeView(int inTheLabCount, int liveVenturesCount,
            List<SandboxSummary> sandboxes,
            List<SideHustleSummary> sideHustles) {
        this.inTheLabCount = inTheLabCount;
        this.liveVenturesCount = liveVenturesCount;
        this.sandboxes = sandboxes;
        this.sideHustles = sideHustles;
    }

    public int getInTheLabCount() {
        return inTheLabCount;
    }

    public int getLiveVenturesCount() {
        return liveVenturesCount;
    }

    public List<SandboxSummary> getSandboxes() {
        return sandboxes;
    }

    public List<SideHustleSummary> getSideHustles() {
        return sideHustles;
    }
}
