package com.placement.portal.controller;

import com.placement.portal.dto.ApiResponse;
import com.placement.portal.dto.ApplicationCreateRequest;
import com.placement.portal.dto.ApplicationResponse;
import com.placement.portal.dto.ApplicationStatusRequest;
import com.placement.portal.service.PlacementApplicationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/applications")
public class ApplicationController {

    private final PlacementApplicationService applicationService;

    public ApplicationController(PlacementApplicationService applicationService) {
        this.applicationService = applicationService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ApplicationResponse>> create(
            @Valid @RequestBody ApplicationCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>(true, "Application submitted successfully", applicationService.create(request)));
    }

    @GetMapping("/student/{studentId}")
    public ApiResponse<List<ApplicationResponse>> byStudent(@PathVariable Long studentId) {
        return new ApiResponse<>(true, "Student applications retrieved", applicationService.byStudent(studentId));
    }

    @GetMapping("/job/{jobId}")
    public ApiResponse<List<ApplicationResponse>> byJob(@PathVariable Long jobId) {
        return new ApiResponse<>(true, "Job applications retrieved", applicationService.byJob(jobId));
    }

    @PutMapping("/{applicationId}/status")
    public ApiResponse<ApplicationResponse> updateStatus(@PathVariable Long applicationId,
                                                          @Valid @RequestBody ApplicationStatusRequest request) {
        return new ApiResponse<>(true, "Application status updated", applicationService.updateStatus(applicationId, request));
    }
}
