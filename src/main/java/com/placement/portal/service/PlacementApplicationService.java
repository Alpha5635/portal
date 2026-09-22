package com.placement.portal.service;

import com.placement.portal.dto.ApplicationCreateRequest;
import com.placement.portal.dto.ApplicationResponse;
import com.placement.portal.dto.ApplicationStatusRequest;
import com.placement.portal.exception.DuplicateResourceException;
import com.placement.portal.exception.ResourceNotFoundException;
import com.placement.portal.model.ApplicationStatus;
import com.placement.portal.model.Company;
import com.placement.portal.model.Job;
import com.placement.portal.model.PlacementApplication;
import com.placement.portal.model.Student;
import com.placement.portal.repository.CompanyRepository;
import com.placement.portal.repository.JobRepository;
import com.placement.portal.repository.PlacementApplicationRepository;
import com.placement.portal.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class PlacementApplicationService {

    private final PlacementApplicationRepository placementApplicationRepository;
    private final StudentRepository studentRepository;
    private final JobRepository jobRepository;
    private final CompanyRepository companyRepository;
    private final SkillMatchService skillMatchService;

    @Autowired
    public PlacementApplicationService(PlacementApplicationRepository placementApplicationRepository,
                                       StudentRepository studentRepository, JobRepository jobRepository,
                                       CompanyRepository companyRepository, SkillMatchService skillMatchService) {
        this.placementApplicationRepository = placementApplicationRepository;
        this.studentRepository = studentRepository;
        this.jobRepository = jobRepository;
        this.companyRepository = companyRepository;
        this.skillMatchService = skillMatchService;
    }

    public PlacementApplicationService(PlacementApplicationRepository placementApplicationRepository) {
        this(placementApplicationRepository, null, null, null, new SkillMatchService());
    }

    public ApplicationResponse create(ApplicationCreateRequest request) {
        Student student = studentRepository.findById(request.studentId())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
        Job job = jobRepository.findById(request.jobId())
                .orElseThrow(() -> new ResourceNotFoundException("Job not found"));
        if (job.getStatus() != com.placement.portal.model.JobStatus.ACTIVE) {
            throw new IllegalArgumentException("Only active jobs accept applications");
        }
        if (placementApplicationRepository.existsByStudentIdAndJobId(student.getId(), job.getId())) {
            throw new DuplicateResourceException("Student has already applied to this job");
        }
        PlacementApplication application = new PlacementApplication();
        application.setStudent(student);
        application.setJob(job);
        application.setApplicationDate(LocalDate.now());
        application.setStatus(ApplicationStatus.APPLIED);
        return toResponse(placementApplicationRepository.save(application));
    }

    public List<ApplicationResponse> byStudent(Long studentId) {
        requireStudent(studentId);
        return placementApplicationRepository.findByStudentId(studentId).stream().map(this::toResponse).toList();
    }

    public List<ApplicationResponse> byJob(Long jobId) {
        requireJob(jobId);
        return placementApplicationRepository.findByJobId(jobId).stream().map(this::toResponse).toList();
    }

    public ApplicationResponse updateStatus(Long applicationId, ApplicationStatusRequest request) {
        PlacementApplication application = placementApplicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found"));
        Company company = companyRepository.findById(request.companyId())
                .orElseThrow(() -> new ResourceNotFoundException("Company not found"));
        if (!application.getJob().getCompany().getId().equals(company.getId())) {
            throw new ResourceNotFoundException("Application not found for this company");
        }
        application.setStatus(request.status());
        return toResponse(placementApplicationRepository.save(application));
    }

    public List<PlacementApplication> all() {
        return placementApplicationRepository.findAll();
    }

    private void requireStudent(Long id) {
        if (!studentRepository.existsById(id)) throw new ResourceNotFoundException("Student not found");
    }

    private void requireJob(Long id) {
        if (!jobRepository.existsById(id)) throw new ResourceNotFoundException("Job not found");
    }

    public ApplicationResponse toResponse(PlacementApplication application) {
        Student student = application.getStudent();
        Job job = application.getJob();
        return new ApplicationResponse(application.getId(), student.getId(), student.getUser().getName(), job.getId(),
                job.getTitle(), job.getCompany().getId(), job.getCompany().getCompanyName(),
                application.getApplicationDate(), application.getStatus(),
                skillMatchService.calculateMatchPercentage(student.getSkills(), job.getSkillsRequired()));
    }
}
