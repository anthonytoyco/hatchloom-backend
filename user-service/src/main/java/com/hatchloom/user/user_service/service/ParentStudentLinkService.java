package com.hatchloom.user.user_service.service;

import com.hatchloom.user.user_service.model.Parent;
import com.hatchloom.user.user_service.model.Student;
import com.hatchloom.user.user_service.model.User;
import com.hatchloom.user.user_service.repository.StudentRepository;
import com.hatchloom.user.user_service.security.SessionManager;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@Slf4j
public class ParentStudentLinkService {

    @Autowired
    private SessionManager sessionManager;

    @Autowired
    private StudentRepository studentRepository;

    public boolean linkParentToStudent(String parentToken, UUID studentId) {
        try {
            User parentUser = sessionManager.getUserFromSessionToken(parentToken);

            if (!(parentUser instanceof Parent)) {
                log.warn("Attempted parent linking by non-parent user");
                return false;
            }

            Student student = studentRepository.findById(studentId).orElse(null);

            if (student == null) {
                log.warn("Student not found for linking: {}", studentId);
                return false;
            }

            student.setParent((Parent) parentUser);
            studentRepository.save(student);

            log.info("Parent {} linked to student {}", parentUser.getId(), studentId);
            return true;
        } catch (Exception e) {
            log.error("Error linking parent to student", e);
            return false;
        }
    }
}