package com.placement.portal.service;

import com.placement.portal.dto.AuthResponse;
import com.placement.portal.dto.LoginRequest;
import com.placement.portal.dto.RegisterRequest;
import com.placement.portal.dto.StudentResponse;
import com.placement.portal.dto.UserResponse;
import com.placement.portal.exception.DuplicateResourceException;
import com.placement.portal.exception.InvalidCredentialsException;
import com.placement.portal.model.Company;
import com.placement.portal.model.Role;
import com.placement.portal.model.Student;
import com.placement.portal.model.User;
import com.placement.portal.repository.CompanyRepository;
import com.placement.portal.repository.StudentRepository;
import com.placement.portal.repository.UserRepository;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Locale;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final CompanyRepository companyRepository;

    @Autowired
    public UserService(UserRepository userRepository, StudentRepository studentRepository,
                       CompanyRepository companyRepository) {
        this.userRepository = userRepository;
        this.studentRepository = studentRepository;
        this.companyRepository = companyRepository;
    }

    public UserService(UserRepository userRepository) {
        this(userRepository, null, null);
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (request.role() == Role.ADMIN) {
            throw new IllegalArgumentException("Admin registration is not allowed");
        }
        String email = normalizeEmail(request.email());
        if (userRepository.existsByEmail(email)) {
            throw new DuplicateResourceException("Email already exists");
        }
        User user = new User();
        user.setName(request.name().trim());
        user.setEmail(email);
        user.setPassword(hash(request.password()));
        user.setRole(request.role());
        user = userRepository.save(user);
        StudentResponse studentResponse = null;
        if (studentRepository != null && request.role() == Role.STUDENT) {
            Student student = new Student();
            student.setUser(user);
            if (request.phone() != null && !request.phone().isBlank()) student.setPhone(request.phone().trim());
            if (request.department() != null && !request.department().isBlank()) student.setDepartment(request.department().trim());
            if (request.year() != null) student.setYear(request.year());
            if (request.skills() != null && !request.skills().isBlank()) student.setSkills(request.skills().trim());
            student = studentRepository.save(student);
            studentResponse = toStudentResponse(student);
        } else if (companyRepository != null) {
            Company company = new Company();
            company.setUser(user);
            company.setCompanyName(request.name().trim());
            companyRepository.save(company);
        }
        return new AuthResponse(toResponse(user), "Registration successful", studentResponse);
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(normalizeEmail(request.email()))
                .orElseThrow(() -> new InvalidCredentialsException("Invalid email or password"));
        if (!user.getPassword().equals(hash(request.password()))) {
            throw new InvalidCredentialsException("Invalid email or password");
        }
        StudentResponse studentResponse = null;
        if (studentRepository != null && user.getRole() == Role.STUDENT) {
            studentResponse = studentRepository.findByUserId(user.getId())
                    .map(this::toStudentResponse)
                    .orElse(null);
        }
        return new AuthResponse(toResponse(user), "Login successful", studentResponse);
    }

    public StudentResponse toStudentResponse(Student student) {
        if (student == null) return null;
        return new StudentResponse(
                student.getId(),
                student.getUser().getId(),
                student.getUser().getName(),
                student.getUser().getEmail(),
                student.getPhone(),
                student.getDepartment(),
                student.getYear(),
                student.getSkills(),
                student.getResumeUrl()
        );
    }

    public User getRequired(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new com.placement.portal.exception.ResourceNotFoundException("User not found"));
    }

    public UserResponse toResponse(User user) {
        return new UserResponse(user.getId(), user.getName(), user.getEmail(), user.getRole());
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }

    private String hash(String password) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256")
                    .digest(password.getBytes(StandardCharsets.UTF_8));
            StringBuilder result = new StringBuilder();
            for (byte value : digest) {
                result.append(String.format("%02x", value));
            }
            return result.toString();
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("Password hashing is unavailable", exception);
        }
    }
}
