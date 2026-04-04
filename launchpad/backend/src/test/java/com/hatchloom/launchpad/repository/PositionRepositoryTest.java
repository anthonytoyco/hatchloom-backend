package com.hatchloom.launchpad.repository;

import java.util.List;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

import com.hatchloom.launchpad.model.Position;
import com.hatchloom.launchpad.model.SideHustle;
import com.hatchloom.launchpad.model.enums.PositionStatus;
import com.hatchloom.launchpad.model.enums.SideHustleStatus;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest(properties = "spring.flyway.enabled=false")
@ActiveProfiles("test")
class PositionRepositoryTest {

    @Autowired
    private PositionRepository positionRepository;

    @Autowired
    private SideHustleRepository sideHustleRepository;

    @Test
    void savePosition_persistsEnumStatus() {
        SideHustle sideHustle = createSideHustle();

        Position position = new Position();
        position.setSideHustle(sideHustle);
        position.setTitle("Backend Engineer");
        position.setDescription("Own API surface");
        position.setStatus(PositionStatus.OPEN);

        Position saved = positionRepository.save(position);

        Position found = positionRepository.findById(saved.getId()).orElse(null);
        assertThat(found).isNotNull();
        assertThat(found.getStatus()).isEqualTo(PositionStatus.OPEN);
    }

    @Test
    void findAllBySideHustleId_returnsSavedPositions() {
        SideHustle sideHustle = createSideHustle();

        Position position = new Position();
        position.setSideHustle(sideHustle);
        position.setTitle("Designer");
        position.setDescription("Landing page and branding");
        position.setStatus(PositionStatus.FILLED);
        positionRepository.save(position);

        List<Position> found = positionRepository.findAllBySideHustle_Id(sideHustle.getId());

        assertThat(found).hasSize(1);
        assertThat(found.get(0).getStatus()).isEqualTo(PositionStatus.FILLED);
    }

    private SideHustle createSideHustle() {
        SideHustle sideHustle = new SideHustle();
        sideHustle.setStudentId(UUID.randomUUID());
        sideHustle.setTitle("BuildLoop");
        sideHustle.setDescription("Build in public");
        sideHustle.setStatus(SideHustleStatus.IN_THE_LAB);
        sideHustle.setHasOpenPositions(false);
        return sideHustleRepository.save(sideHustle);
    }
}
