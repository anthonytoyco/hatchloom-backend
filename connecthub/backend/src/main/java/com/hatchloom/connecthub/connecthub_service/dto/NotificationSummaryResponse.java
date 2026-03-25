package com.hatchloom.connecthub.connecthub_service.dto;

import java.util.List;

public record NotificationSummaryResponse(
        Integer classifiedUnreadCount,
        Integer messageUnreadCount,
        Integer totalUnreadCount,
        List<NotificationResponse> classifiedNotifications,
        List<NotificationResponse> messageNotifications,
        Boolean isSubscribedToClassifieds
){
}
