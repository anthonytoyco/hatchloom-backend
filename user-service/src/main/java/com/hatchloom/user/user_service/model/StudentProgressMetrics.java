package com.hatchloom.user.user_service.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Embeddable
@Data
@NoArgsConstructor
@AllArgsConstructor
public class StudentProgressMetrics {

    @Column
    private LocalDateTime lastActive;

    @Column
    private Integer skillsCertified;

    @Column
    private Integer explorerLevelXp;

    @Column
    private Integer currentStreak;

    @Column
    private Integer activeVentures;

    @Column
    private Integer problemsTackled;
}