package com.hatchloom.user.user_service.model;

import com.hatchloom.user.user_service.dto.ProfileDTO;
import com.hatchloom.user.user_service.dto.UpdateProfileRequest;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Entity
@Table(name = "academic_profiles")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class AcademicProfile extends UserProfile {

    private String gradeLevel;
    private String specialization;

    @Embedded
    @AttributeOverrides({
            @AttributeOverride(name = "lastActive", column = @Column(name = "last_active")),
            @AttributeOverride(name = "skillsCertified", column = @Column(name = "skills_certified")),
            @AttributeOverride(name = "explorerLevelXp", column = @Column(name = "explorer_level_xp")),
            @AttributeOverride(name = "currentStreak", column = @Column(name = "current_streak")),
            @AttributeOverride(name = "activeVentures", column = @Column(name = "active_ventures")),
            @AttributeOverride(name = "problemsTackled", column = @Column(name = "problems_tackled"))
    })
    private StudentProgressMetrics studentProgress;

    @Override
    public String getProfileType() {
        return "ACADEMIC";
    }

    @Override
    public void enrichProfileDTO(ProfileDTO.ProfileDTOBuilder builder, User user) {
        builder.gradeLevel(this.gradeLevel)
                .specialization(this.specialization);

        // Only include student metrics if this is a Student user's profile
        if (user instanceof Student && this.studentProgress != null) {
            builder.lastActive(this.studentProgress.getLastActive() == null ? null
                    : this.studentProgress.getLastActive().toString())
                    .skillsCertified(this.studentProgress.getSkillsCertified())
                    .explorerLevelXp(this.studentProgress.getExplorerLevelXp())
                    .currentStreak(this.studentProgress.getCurrentStreak())
                    .activeVentures(this.studentProgress.getActiveVentures())
                    .problemsTackled(this.studentProgress.getProblemsTackled());
        }
    }

    @Override
    public void applyUpdates(UpdateProfileRequest request, User user) {
        if (request.getGradeLevel() != null) {
            this.gradeLevel = request.getGradeLevel();
        }
        if (request.getSpecialization() != null) {
            this.specialization = request.getSpecialization();
        }

        // Student progression counters only apply to Student users
        if (user instanceof Student) {
            ensureStudentProgressInitialized();

            if (request.getSkillsCertified() != null) {
                this.studentProgress.setSkillsCertified(request.getSkillsCertified());
            }
            if (request.getExplorerLevelXp() != null) {
                this.studentProgress.setExplorerLevelXp(request.getExplorerLevelXp());
            }
            if (request.getCurrentStreak() != null) {
                this.studentProgress.setCurrentStreak(request.getCurrentStreak());
            }
            if (request.getActiveVentures() != null) {
                this.studentProgress.setActiveVentures(request.getActiveVentures());
            }
            if (request.getProblemsTackled() != null) {
                this.studentProgress.setProblemsTackled(request.getProblemsTackled());
            }
        }
    }

    @Override
    public void onUserLogin(User user) {
        // Update lastActive timestamp for Student users on successful login
        if (user instanceof Student) {
            ensureStudentProgressInitialized();
            this.studentProgress.setLastActive(LocalDateTime.now());
        }
    }

    @Override
    public void initializeDefaults(User user) {
        this.gradeLevel = "Not Set";
        this.specialization = "Not Set";

        // Student metrics initialize as null values to keep the API payload shape
        // stable.
        if (user instanceof Student) {
            this.studentProgress = new StudentProgressMetrics(null, null, null, null, null, null);
        }
    }

    @Override
    public Map<String, Object> getExtendedFields() {
        Map<String, Object> fields = new HashMap<>();
        fields.put("gradeLevel", gradeLevel);
        fields.put("specialization", specialization);

        if (this.getUser() instanceof Student && this.studentProgress != null) {
            fields.put("lastActive", studentProgress.getLastActive());
            fields.put("skillsCertified", studentProgress.getSkillsCertified());
            fields.put("explorerLevelXp", studentProgress.getExplorerLevelXp());
            fields.put("currentStreak", studentProgress.getCurrentStreak());
            fields.put("activeVentures", studentProgress.getActiveVentures());
            fields.put("problemsTackled", studentProgress.getProblemsTackled());
        }

        return fields;
    }

    private void ensureStudentProgressInitialized() {
        if (this.studentProgress == null) {
            this.studentProgress = new StudentProgressMetrics();
        }
    }

    public LocalDateTime getLastActive() {
        return this.studentProgress == null ? null : this.studentProgress.getLastActive();
    }

    public Integer getSkillsCertified() {
        return this.studentProgress == null ? null : this.studentProgress.getSkillsCertified();
    }

    public Integer getExplorerLevelXp() {
        return this.studentProgress == null ? null : this.studentProgress.getExplorerLevelXp();
    }

    public Integer getCurrentStreak() {
        return this.studentProgress == null ? null : this.studentProgress.getCurrentStreak();
    }

    public Integer getActiveVentures() {
        return this.studentProgress == null ? null : this.studentProgress.getActiveVentures();
    }

    public Integer getProblemsTackled() {
        return this.studentProgress == null ? null : this.studentProgress.getProblemsTackled();
    }
}
