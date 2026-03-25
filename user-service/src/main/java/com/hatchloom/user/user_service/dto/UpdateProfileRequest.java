package com.hatchloom.user.user_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateProfileRequest {
    private String bio;
    private String description;
    private String profilePictureUrl;
    private String gradeLevel;     // For academic profiles
    private String specialization; // For academic profiles
    private Integer skillsCertified;
    private Integer explorerLevelXp;
    private Integer currentStreak;
    private Integer activeVentures;
    private Integer problemsTackled;
    private String companyName;    // For professional profiles
    private String jobTitle;       // For professional profiles
    private String expertise;      // For professional profiles
}
