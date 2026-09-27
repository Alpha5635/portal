package com.placement.portal.service;

import com.placement.portal.dto.ApplicationResponse;
import com.placement.portal.dto.DashboardResponse;
import com.placement.portal.dto.JobResponse;
import com.placement.portal.dto.StudentResponse;
import com.placement.portal.dto.CompanyResponse;
import com.placement.portal.model.ApplicationStatus;
import com.placement.portal.model.Role;
import com.placement.portal.repository.CompanyRepository;
import com.placement.portal.repository.JobRepository;
import com.placement.portal.repository.PlacementApplicationRepository;
import com.placement.portal.repository.StudentRepository;
import com.placement.portal.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final CompanyRepository companyRepository;
    private final JobRepository jobRepository;
    private final PlacementApplicationRepository applicationRepository;
    private final StudentService studentService;
    private final CompanyService companyService;
    private final JobService jobService;
    private final PlacementApplicationService applicationService;

    public AdminService(UserRepository userRepository, StudentRepository studentRepository,
                        CompanyRepository companyRepository, JobRepository jobRepository,
                        PlacementApplicationRepository applicationRepository, StudentService studentService,
                        CompanyService companyService, JobService jobService,
                        PlacementApplicationService applicationService) {
        this.userRepository = userRepository;
        this.studentRepository = studentRepository;
        this.companyRepository = companyRepository;
        this.jobRepository = jobRepository;
        this.applicationRepository = applicationRepository;
        this.studentService = studentService;
        this.companyService = companyService;
        this.jobService = jobService;
        this.applicationService = applicationService;
    }

    public List<StudentResponse> students() {
        return studentRepository.findAll().stream().map(studentService::toResponse).toList();
    }

    public List<CompanyResponse> companies() {
        return companyService.list();
    }

    public List<JobResponse> jobs() {
        return jobService.list(null);
    }

    public List<ApplicationResponse> applications() {
        return applicationService.all().stream().map(applicationService::toResponse).toList();
    }

    public DashboardResponse dashboard() {
        long totalStudents = userRepository.countByRole(Role.STUDENT);
        long totalCompanies = userRepository.countByRole(Role.COMPANY);
        long totalJobs = jobRepository.count();
        long totalApplications = applicationRepository.count();
        long shortlisted = applicationRepository.countByStatus(ApplicationStatus.SHORTLISTED);
        long rejected = applicationRepository.countByStatus(ApplicationStatus.REJECTED);
        return new DashboardResponse(totalStudents, totalCompanies, totalJobs, totalApplications,
                shortlisted, applicationRepository.countByStatus(ApplicationStatus.APPLIED), rejected);
    }
}