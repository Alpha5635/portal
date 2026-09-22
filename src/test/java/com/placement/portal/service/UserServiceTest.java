package com.placement.portal.service;

import com.placement.portal.dto.AuthResponse;
import com.placement.portal.dto.LoginRequest;
import com.placement.portal.dto.RegisterRequest;
import com.placement.portal.model.Role;
import com.placement.portal.model.User;
import com.placement.portal.repository.CompanyRepository;
import com.placement.portal.repository.StudentRepository;
import com.placement.portal.repository.UserRepository;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class UserServiceTest {

    @Test
    void registersStudentWithoutReturningPassword() {
        UserRepository users = mock(UserRepository.class);
        StudentRepository students = mock(StudentRepository.class);
        CompanyRepository companies = mock(CompanyRepository.class);
        when(users.existsByEmail("student@example.com")).thenReturn(false);
        when(users.save(any(User.class))).thenAnswer(invocation -> {
            User user = invocation.getArgument(0);
            user.setId(1L);
            return user;
        });

        AuthResponse response = new UserService(users, students, companies).register(
                new RegisterRequest("Student", "student@example.com", "secret1", Role.STUDENT));

        assertThat(response.user().email()).isEqualTo("student@example.com");
        verify(students).save(any());
        assertThat(response.user()).hasNoNullFieldsOrPropertiesExcept();
    }

    @Test
    void logsInWithStoredHash() {
        UserRepository users = mock(UserRepository.class);
        UserService service = new UserService(users);
        User user = new User();
        user.setId(1L);
        user.setName("Student");
        user.setEmail("student@example.com");
        user.setRole(Role.STUDENT);
        user.setPassword("2bb80d537b1da3e38bd30361aa855686bde0ba3c2f8f0f5e6f3a7c2f6f0f2f2f");
        when(users.findByEmail("student@example.com")).thenReturn(java.util.Optional.of(user));

        // The service must reject a password that does not match the stored value.
        org.assertj.core.api.Assertions.assertThatThrownBy(() -> service.login(
                new LoginRequest("student@example.com", "wrong")))
                .isInstanceOf(com.placement.portal.exception.InvalidCredentialsException.class);
    }
}
