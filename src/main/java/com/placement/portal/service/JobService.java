package com.placement.portal.service;

import com.placement.portal.dto.JobRequest;
import com.placement.portal.dto.JobResponse;
import com.placement.portal.exception.ResourceNotFoundException;
import com.placement.portal.model.Company;
import com.placement.portal.model.Job;
import com.placement.portal.model.JobStatus;
import com.placement.portal.repository.CompanyRepository;
import com.placement.portal.repository.JobRepository;
import com.placement.portal.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class JobService {

    private final JobRepository jobRepository;
    private final CompanyRepository companyRepository;
    private final SkillMatchService skillMatchService;
    private final StudentRepository studentRepository;

    @Autowired
    public JobService(JobRepository jobRepository, CompanyRepository companyRepository,
                      SkillMatchService skillMatchService, StudentRepository studentRepository) {
        this.jobRepository = jobRepository;
        this.companyRepository = companyRepository;
        this.skillMatchService = skillMatchService;
        this.studentRepository = studentRepository;
    }

    public JobService(JobRepository jobRepository) {
        this(jobRepository, null, new SkillMatchService(), null);
    }

    public List<JobResponse> list(Long studentId) {
        return jobRepository.findAll().stream().map(job -> toResponse(job, studentId)).toList();
    }

    public Job getRequired(Long id) {
        return jobRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Job not found"));
    }

    public JobResponse get(Long id, Long studentId) {
        return toResponse(getRequired(id), studentId);
    }

    public JobResponse create(JobRequest request) {
        Company company = getCompany(request.companyId());
        Job job = new Job();
        apply(job, request, company);
        return toResponse(jobRepository.save(job), null);
    }

    public JobResponse update(Long id, JobRequest request) {
        Job job = getRequired(id);
        if (!job.getCompany().getId().equals(request.companyId())) {
            throw new ResourceNotFoundException("Job not found for this company");
        }
        apply(job, request, job.getCompany());
        return toResponse(jobRepository.save(job), null);
    }

    public void delete(Long id, Long companyId) {
        Job job = getRequired(id);
        if (!job.getCompany().getId().equals(companyId)) {
            throw new ResourceNotFoundException("Job not found for this company");
        }
        jobRepository.delete(job);
    }

    public List<Job> all() {
        return jobRepository.findAll();
    }

    private Company getCompany(Long id) {
        if (companyRepository == null) {
            throw new IllegalStateException("Company repository is unavailable");
        }
        return companyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found"));
    }

    private void apply(Job job, JobRequest request, Company company) {
        job.setCompany(company);
        job.setTitle(request.title().trim());
        job.setDescription(request.description());
        job.setSkillsRequired(request.skillsRequired());
        job.setLocation(request.location().trim());
        job.setSalary(request.salary());
        job.setJobType(request.jobType());
        job.setDeadline(request.deadline());
        job.setStatus(request.status() == null ? JobStatus.ACTIVE : request.status());
    }

    private JobResponse toResponse(Job job, Long studentId) {
        Double match = null;
        if (studentId != null && studentRepository != null) {
            match = studentRepository.findById(studentId)
                    .map(student -> skillMatchService.calculateMatchPercentage(student.getSkills(), job.getSkillsRequired()))
                    .orElse(0.0);
        }
        return new JobResponse(job.getId(), job.getCompany().getId(), job.getCompany().getCompanyName(),
                job.getTitle(), job.getDescription(), job.getSkillsRequired(), job.getLocation(), job.getSalary(),
                job.getJobType(), job.getDeadline(), job.getStatus(), match);
    }
}
