package com.placement.portal.controller;

import com.placement.portal.dto.ApiResponse;
import com.placement.portal.dto.JobMatchResponse;
import com.placement.portal.dto.JobRequest;
import com.placement.portal.dto.JobResponse;
import com.placement.portal.model.Job;
import com.placement.portal.model.Student;
import com.placement.portal.repository.StudentRepository;
import com.placement.portal.service.AiService;
import com.placement.portal.service.JobService;
import com.placement.portal.service.SkillMatchService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
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
    private final SkillMatchService skillMatchService;
    private final StudentRepository studentRepository;
    private final AiService aiService;

    @Autowired
    public JobController(JobService jobService, SkillMatchService skillMatchService,
                         StudentRepository studentRepository, AiService aiService) {
        this.jobService = jobService;
        this.skillMatchService = skillMatchService != null ? skillMatchService : new SkillMatchService();
        this.studentRepository = studentRepository;
        this.aiService = aiService;
    }

    public JobController(JobService jobService) {
        this(jobService, new SkillMatchService(), null, null);
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

    @GetMapping("/{id}/match")
    public ApiResponse<JobMatchResponse> match(@PathVariable Long id,
                                               @RequestParam(required = false) Long studentId) {
        Job job = jobService.getRequired(id);
        Student student = (studentId != null && studentRepository != null)
                ? studentRepository.findById(studentId).orElse(null)
                : null;

        String studentSkills = student != null ? student.getSkills() : "Java, Spring Boot, MySQL, React, Git";
        double percentage = skillMatchService.calculateMatchPercentage(studentSkills, job.getSkillsRequired());
        List<String> matching = skillMatchService.getMatchingSkills(studentSkills, job.getSkillsRequired());
        List<String> missing = skillMatchService.getMissingSkills(studentSkills, job.getSkillsRequired());

        String explanation = aiService != null
                ? aiService.explainJobMatch(job.getTitle(), percentage, matching, missing)
                : "Match calculated from skill alignment.";

        JobMatchResponse response = new JobMatchResponse(
                job.getId(), job.getTitle(), percentage, matching, missing, explanation
        );
        return new ApiResponse<>(true, "Job match calculated", response);
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
