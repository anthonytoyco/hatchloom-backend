package com.hatchloom.user.user_service.repository;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
class UserRepositoryTest {

    @Autowired
    private UserRepository userRepository;

    @Test
    void findByUsername_whenRepositoryIsEmpty_returnsEmpty() {
        assertThat(userRepository.findByUsername("missing_user")).isEmpty();
    }

    @Test
    void findByEmail_whenRepositoryIsEmpty_returnsEmpty() {
        assertThat(userRepository.findByEmail("missing@example.com")).isEmpty();
    }

    @Test
    void existsChecks_whenRepositoryIsEmpty_returnFalse() {
        assertThat(userRepository.existsByUsername("missing_user")).isFalse();
        assertThat(userRepository.existsByEmail("missing@example.com")).isFalse();
    }
}
