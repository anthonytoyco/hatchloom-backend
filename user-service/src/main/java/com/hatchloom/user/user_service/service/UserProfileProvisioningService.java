package com.hatchloom.user.user_service.service;

import com.hatchloom.user.user_service.model.*;
import com.hatchloom.user.user_service.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UserProfileProvisioningService {

    @Autowired
    private UserRepository userRepository;

    public void createDefaultProfileForUser(User user) {
        UserProfile profile = null;

        if (user instanceof Student || user instanceof SchoolTeacher) {
            profile = new AcademicProfile();
        } else if (user instanceof SchoolAdmin || user instanceof HatchloomAdmin || user instanceof HatchloomTeacher
                || user instanceof Parent) {
            profile = new ProfessionalProfile();
        }

        if (profile == null) {
            return;
        }

        profile.setUser(user);
        profile.setBio("Bio");
        profile.setDescription("Description");
        profile.initializeDefaults(user);
        user.setProfile(profile);
        userRepository.save(user);
    }
}