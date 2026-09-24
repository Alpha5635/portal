package com.placement.portal.service;

import com.placement.portal.dto.StudentResponse;
import com.placement.portal.dto.StudentUpdateRequest;
import com.placement.portal.exception.DuplicateResourceException;
import com.placement.portal.exception.ResourceNotFoundException;
import com.placement.portal.model.Student;
import com.placement.portal.repository.StudentRepository;
import com.placement.portal.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class StudentService {

    private final StudentRepository studentRepository;
    private final UserRepository userRepository;

    @Autowired
    public StudentService(StudentRepository studentRepository, UserRepository userRepository) {
        this.studentRepository = studentRepository;
        this.userRepository = userRepository;
    }

    public StudentService(StudentRepository studentRepository) {
        this(studentRepository, null);
    }

    public Student getRequired(Long id) {
        return studentRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Student not found"));
    }

    public StudentResponse getProfile(Long id) {
        return toResponse(getRequired(id));
    }

    public StudentResponse update(Long id, StudentUpdateRequest request) {
        Student student = getRequired(id);
        if (request.email() != null && !request.email().equalsIgnoreCase(student.getUser().getEmail())
                && userRepository != null && userRepository.existsByEmail(request.email().trim().toLowerCase())) {
            throw new DuplicateResourceException("Email already exists");
        }
        if (request.name() != null) student.getUser().setName(request.name().trim());
        if (request.email() != null) student.getUser().setEmail(request.email().trim().toLowerCase());
        if (request.phone() != null) student.setPhone(request.phone());
        if (request.department() != null) student.setDepartment(request.department());
        if (request.year() != null) student.setYear(request.year());
        if (request.skills() != null) student.setSkills(request.skills());
        if (request.resumeUrl() != null) student.setResumeUrl(request.resumeUrl());
        return toResponse(studentRepository.save(student));
    }

    public StudentResponse toResponse(Student student) {
        return new StudentResponse(student.getId(), student.getUser().getId(), student.getUser().getName(),
                student.getUser().getEmail(), student.getPhone(), student.getDepartment(), student.getYear(),
                student.getSkills(), student.getResumeUrl());
    }
}
