package com.hatchloom.launchpad.controller;

import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.eq;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.server.ResponseStatusException;

import com.hatchloom.launchpad.dto.request.AddTeamMemberRequest;
import com.hatchloom.launchpad.dto.response.TeamMemberResponse;
import com.hatchloom.launchpad.model.Team;
import com.hatchloom.launchpad.model.TeamMember;
import com.hatchloom.launchpad.service.TeamService;

/**
 * Controller-layer unit tests for {@link TeamController}.
 */
@ExtendWith(MockitoExtension.class)
class TeamControllerTest {

    @Mock
    private TeamService teamService;

    @InjectMocks
    private TeamController controller;

    @Test
    void addMember_extractsCallerIdFromJwt_returns201() {
        UUID sideHustleId = UUID.randomUUID();
        UUID callerId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        Jwt jwt = buildJwt(callerId);

        AddTeamMemberRequest request = new AddTeamMemberRequest();
        request.setUserId(userId);
        request.setRole("Developer");

        when(teamService.addMember(eq(sideHustleId), eq(userId), eq("Developer"), eq(callerId)))
                .thenReturn(buildMemberResponse(userId, "Developer"));

        ResponseEntity<TeamMemberResponse> response = controller.addMember(sideHustleId, request, jwt);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertNotNull(response.getBody());
        verify(teamService).addMember(sideHustleId, userId, "Developer", callerId);
    }

    @Test
    void listMembers_delegatesToService_returns200() {
        UUID sideHustleId = UUID.randomUUID();
        when(teamService.listMembers(sideHustleId)).thenReturn(List.of());

        ResponseEntity<List<TeamMemberResponse>> response = controller.listMembers(sideHustleId);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        verify(teamService).listMembers(sideHustleId);
    }

    @Test
    void removeMember_extractsCallerIdFromJwt_returns204() {
        UUID sideHustleId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        UUID callerId = UUID.randomUUID();
        Jwt jwt = buildJwt(callerId);

        ResponseEntity<Void> response = controller.removeMember(sideHustleId, userId, jwt);

        assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
        verify(teamService).removeMember(sideHustleId, userId, callerId);
    }

    @Test
    void removeMember_notOwner_propagates403() {
        UUID sideHustleId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        UUID callerId = UUID.randomUUID();
        Jwt jwt = buildJwt(callerId);

        doThrow(new ResponseStatusException(HttpStatus.FORBIDDEN, "You do not own this SideHustle"))
                .when(teamService).removeMember(eq(sideHustleId), eq(userId), eq(callerId));

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> controller.removeMember(sideHustleId, userId, jwt));
        assertEquals(HttpStatus.FORBIDDEN.value(), ex.getStatusCode().value());
    }

    private Jwt buildJwt(UUID subject) {
        return Jwt.withTokenValue("token")
                .header("alg", "none")
                .subject(subject.toString())
                .build();
    }

    private TeamMemberResponse buildMemberResponse(UUID userId, String role) {
        Team team = new Team();
        TeamMember member = new TeamMember();
        member.setTeam(team);
        member.setStudentId(userId);
        member.setRole(role);
        return TeamMemberResponse.from(member);
    }
}
