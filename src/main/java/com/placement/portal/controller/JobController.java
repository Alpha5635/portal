package com.placement.portal.controller;

import com.placement.portal.dto.ApiResponse;
import com.placement.portal.dto.JobRequest;
import com.placement.portal.dto.JobResponse;
import com.placement.portal.service.JobService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/jobs")
public class JobController {

    private final JobService jobService;

    public JobController(JobService jobService) {
        this.jobService = jobService;
    }

    @GetMapping
    public ApiResponse<List<JobResponse>> list(@RequestParam(required = false) Long studentId) {
        return new ApiResponse<>(true, "Jobs retrieved", jobService.list(studentId));
    }

    @GetMapping("/{id}")
    public ApiResponse<JobResponse> get(@PathVariable Long id,
                                        @RequestParam(required = false) Long studentId) {
        return new ApiResponse<>(true, "Job retrieved", jobService.get(id, studentId));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<JobResponse>> create(@Valid @RequestBody JobRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>(true, "Job created successfully", jobService.create(request)));
    }

    @PutMapping("/{id}")
    public ApiResponse<JobResponse> update(@PathVariable Long id, @Valid @RequestBody JobRequest request) {
        return new ApiResponse<>(true, "Job updated successfully", jobService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id, @RequestParam Long companyId) {
        jobService.delete(id, companyId);
        return new ApiResponse<>(true, "Job deleted successfully", null);
    }
}
