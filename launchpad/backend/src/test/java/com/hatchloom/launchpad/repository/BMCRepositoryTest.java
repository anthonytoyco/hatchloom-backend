package com.hatchloom.launchpad.repository;

import java.util.List;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

import com.hatchloom.launchpad.model.BusinessModelCanvas;
import com.hatchloom.launchpad.model.SideHustle;
import com.hatchloom.launchpad.model.enums.SideHustleStatus;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest(properties = "spring.flyway.enabled=false")
@ActiveProfiles("test")
class BMCRepositoryTest {

    @Autowired
    private BusinessModelCanvasRepository bmcRepository;

    @Autowired
    private SideHustleRepository sideHustleRepository;

    @Test
    void saveAndFindBySideHustleId_persistsAllFields() {
        UUID ownerId = UUID.randomUUID();

        SideHustle sideHustle = new SideHustle();
        sideHustle.setStudentId(ownerId);
        sideHustle.setTitle("StudySprint");
        sideHustle.setDescription("Peer study marketplace");
        sideHustle.setStatus(SideHustleStatus.IN_THE_LAB);
        sideHustle.setHasOpenPositions(false);
        sideHustle = sideHustleRepository.save(sideHustle);

        BusinessModelCanvas bmc = new BusinessModelCanvas();
        bmc.setSideHustle(sideHustle);
        bmc.setValuePropositions("Fast matching");
        bmc.setChannels("Discord");
        bmcRepository.save(bmc);

        BusinessModelCanvas found = bmcRepository.findBySideHustle_Id(sideHustle.getId()).orElse(null);

        assertThat(found).isNotNull();
        assertThat(found.getValuePropositions()).isEqualTo("Fast matching");
        assertThat(found.getChannels()).isEqualTo("Discord");
        assertThat(found.getSideHustle().getId()).isEqualTo(sideHustle.getId());
    }

    @Test
    void sideHustleRepository_findAllByStudentId_returnsOwnedSideHustles() {
        UUID ownerId = UUID.randomUUID();

        SideHustle sideHustle = new SideHustle();
        sideHustle.setStudentId(ownerId);
        sideHustle.setTitle("MakerBoard");
        sideHustle.setDescription("Project board");
        sideHustle.setStatus(SideHustleStatus.IN_THE_LAB);
        sideHustle.setHasOpenPositions(false);
        sideHustleRepository.save(sideHustle);

        List<SideHustle> owned = sideHustleRepository.findAllByStudentId(ownerId);

        assertThat(owned).hasSize(1);
        assertThat(owned.get(0).getTitle()).isEqualTo("MakerBoard");
    }
}
