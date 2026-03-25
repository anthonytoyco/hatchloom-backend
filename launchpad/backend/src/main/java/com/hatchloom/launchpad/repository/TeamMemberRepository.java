package com.hatchloom.launchpad.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.hatchloom.launchpad.model.TeamMember;

/**
 * Repository for {@link TeamMember} entities.
 */
public interface TeamMemberRepository extends JpaRepository<TeamMember, UUID> {

    /**
     * Returns all members of the given team.
     *
     * @param teamId the team's UUID
     * @return list of team members, empty if none found
     */
    List<TeamMember> findAllByTeam_Id(UUID teamId);

    /**
     * Checks whether a student is already a member of a team.
     * Used to prevent duplicate membership.
     *
     * @param teamId    the team's UUID
     * @param studentId the student's UUID
     * @return {@code true} if the student is already a member
     */
    boolean existsByTeam_IdAndStudentId(UUID teamId, UUID studentId);

    /**
     * Finds a specific team member by team and student.
     *
     * @param teamId    the team's UUID
     * @param studentId the student's UUID
     * @return the TeamMember wrapped in Optional, or empty if not found
     */
    Optional<TeamMember> findByTeam_IdAndStudentId(UUID teamId, UUID studentId);
}
