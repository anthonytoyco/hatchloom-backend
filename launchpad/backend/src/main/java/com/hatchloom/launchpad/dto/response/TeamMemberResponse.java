package com.hatchloom.launchpad.dto.response;

import java.time.LocalDateTime;
import java.util.UUID;

import com.hatchloom.launchpad.model.TeamMember;

/** Response body representing a TeamMember. */
public class TeamMemberResponse {

    private UUID id;
    private UUID teamId;
    private UUID studentId;
    private String role;
    private LocalDateTime joinedAt;

    /**
     * Maps a {@link TeamMember} entity to a {@link TeamMemberResponse}.
     *
     * @param member the entity to map
     * @return the response DTO
     */
    public static TeamMemberResponse from(TeamMember member) {
        TeamMemberResponse r = new TeamMemberResponse();
        r.id = member.getId();
        r.teamId = member.getTeam().getId();
        r.studentId = member.getStudentId();
        r.role = member.getRole();
        r.joinedAt = member.getJoinedAt();
        return r;
    }

    public UUID getId() {
        return id;
    }

    public UUID getTeamId() {
        return teamId;
    }

    public UUID getStudentId() {
        return studentId;
    }

    public String getRole() {
        return role;
    }

    public LocalDateTime getJoinedAt() {
        return joinedAt;
    }
}
