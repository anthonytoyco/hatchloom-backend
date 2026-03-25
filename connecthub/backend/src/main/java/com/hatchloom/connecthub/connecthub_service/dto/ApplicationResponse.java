package com.hatchloom.connecthub.connecthub_service.dto;

import com.hatchloom.connecthub.connecthub_service.model.ClassifiedPost;

import java.util.List;

public record ApplicationResponse(
        List<ClassifiedPost> classifiedPosts,
        Integer totalApplications
) {}