package com.hatchloom.launchpad.service;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.hatchloom.launchpad.dto.response.TeamMemberResponse;
import com.hatchloom.launchpad.model.SideHustle;
import com.hatchloom.launchpad.model.Team;
import com.hatchloom.launchpad.model.TeamMember;
import com.hatchloom.launchpad.repository.TeamMemberRepository;
import com.hatchloom.launchpad.repository.TeamRepository;

/**
 * Service for Team membership operations.
 *
 * <p>
 * The Team record is auto-created alongside its SideHustle. This service only
 * manages adding and removing {@link TeamMember} records within that team.
 * </p>
 */
@Service
public class TeamService {

        private final TeamRepository teamRepository;
        private final TeamMemberRepository teamMemberRepository;
        private final SideHustleService sideHustleService;

        public TeamService(TeamRepository teamRepository,
                        TeamMemberRepository teamMemberRepository,
                        SideHustleService sideHustleService) {
                this.teamRepository = teamRepository;
                this.teamMemberRepository = teamMemberRepository;
                this.sideHustleService = sideHustleService;
        }

        /**
         * Adds a student as a team member of a SideHustle. Validates ownership and
         * prevents duplicate membership.
         *
         * @param sideHustleId the SideHustle UUID
         * @param userId       the student UUID to add
         * @param role         optional role label
         * @param callerId     the authenticated student's UUID (must own the
         *                     SideHustle)
         * @return the created {@link TeamMemberResponse}
         */
        @Transactional
        public TeamMemberResponse addMember(UUID sideHustleId, UUID userId,
                        String role, UUID callerId) {
                SideHustle sideHustle = sideHustleService.findOrThrow(sideHustleId);
                if (!sideHustle.getStudentId().equals(callerId)) {
                        throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                                        "You do not own this SideHustle");
                }

                Team team = teamRepository.findBySideHustle_Id(sideHustleId)
                                .orElseThrow(() -> new ResponseStatusException(
                                                HttpStatus.NOT_FOUND,
                                                "Team not found for SideHustle: " + sideHustleId));

                if (teamMemberRepository.existsByTeam_IdAndStudentId(team.getId(), userId)) {
                        throw new ResponseStatusException(HttpStatus.CONFLICT,
                                        "Student " + userId + " is already a member of this team");
                }

                TeamMember member = new TeamMember();
                member.setTeam(team);
                member.setStudentId(userId);
                member.setRole(role);
                return TeamMemberResponse.from(teamMemberRepository.save(member));
        }

        /**
         * Removes a student from a SideHustle's team.
         *
         * @param sideHustleId the SideHustle UUID
         * @param userId       the student UUID to remove
         * @param callerId     the authenticated student's UUID (must own the
         *                     SideHustle)
         */
        @Transactional
        public void removeMember(UUID sideHustleId, UUID userId, UUID callerId) {
                SideHustle sideHustle = sideHustleService.findOrThrow(sideHustleId);
                if (!sideHustle.getStudentId().equals(callerId)) {
                        throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                                        "You do not own this SideHustle");
                }

                Team team = teamRepository.findBySideHustle_Id(sideHustleId)
                                .orElseThrow(() -> new ResponseStatusException(
                                                HttpStatus.NOT_FOUND,
                                                "Team not found for SideHustle: " + sideHustleId));

                TeamMember member = teamMemberRepository.findByTeam_IdAndStudentId(team.getId(), userId)
                                .orElseThrow(() -> new ResponseStatusException(
                                                HttpStatus.NOT_FOUND, "Member " + userId + " not found in team"));

                teamMemberRepository.delete(member);
        }

        /**
         * Lists all members of a SideHustle's team.
         *
         * @param sideHustleId the SideHustle UUID
         * @return list of {@link TeamMemberResponse}
         */
        @Transactional(readOnly = true)
        public List<TeamMemberResponse> listMembers(UUID sideHustleId) {
                Team team = teamRepository.findBySideHustle_Id(sideHustleId)
                                .orElseThrow(() -> new ResponseStatusException(
                                                HttpStatus.NOT_FOUND,
                                                "Team not found for SideHustle: " + sideHustleId));

                return teamMemberRepository.findAllByTeam_Id(team.getId())
                                .stream()
                                .map(TeamMemberResponse::from)
                                .toList();
        }
}
