package com.placement.portal.controller;

import com.placement.portal.dto.ApiResponse;
import com.placement.portal.dto.ApplicationResponse;
import com.placement.portal.dto.StudentResponse;
import com.placement.portal.dto.StudentUpdateRequest;
import com.placement.portal.service.PlacementApplicationService;
import com.placement.portal.service.StudentService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/students")
public class StudentController {

    private final StudentService studentService;
    private final PlacementApplicationService applicationService;

    public StudentController(StudentService studentService, PlacementApplicationService applicationService) {
        this.studentService = studentService;
        this.applicationService = applicationService;
    }

    @GetMapping("/{id}")
    public ApiResponse<StudentResponse> get(@PathVariable Long id) {
        return new ApiResponse<>(true, "Student profile retrieved", studentService.getProfile(id));
    }

    @PutMapping("/{id}")
    public ApiResponse<StudentResponse> update(@PathVariable Long id,
                                                @Valid @RequestBody StudentUpdateRequest request) {
        return new ApiResponse<>(true, "Student profile updated", studentService.update(id, request));
    }

    @GetMapping("/{id}/applications")
    public ApiResponse<List<ApplicationResponse>> applications(@PathVariable Long id) {
        return new ApiResponse<>(true, "Student applications retrieved", applicationService.byStudent(id));
    }
}
