package com.placement.portal.service;

import com.placement.portal.dto.DashboardResponse;
import com.placement.portal.model.ApplicationStatus;
import com.placement.portal.model.Role;
import com.placement.portal.repository.CompanyRepository;
import com.placement.portal.repository.JobRepository;
import com.placement.portal.repository.PlacementApplicationRepository;
import com.placement.portal.repository.StudentRepository;
import com.placement.portal.repository.UserRepository;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

class AdminServiceTest {

    @Test
    void calculatesDashboardStatistics() {
        UserRepository users = mock(UserRepository.class);
        StudentRepository students = mock(StudentRepository.class);
        CompanyRepository companies = mock(CompanyRepository.class);
        JobRepository jobs = mock(JobRepository.class);
        PlacementApplicationRepository applications = mock(PlacementApplicationRepository.class);
        when(users.countByRole(Role.STUDENT)).thenReturn(2L);
        when(users.countByRole(Role.COMPANY)).thenReturn(1L);
        when(jobs.count()).thenReturn(3L);
        when(applications.count()).thenReturn(4L);
        when(applications.countByStatus(ApplicationStatus.SHORTLISTED)).thenReturn(1L);
        when(applications.countByStatus(ApplicationStatus.APPLIED)).thenReturn(2L);
        when(applications.countByStatus(ApplicationStatus.REJECTED)).thenReturn(1L);

        AdminService service = new AdminService(users, students, companies, jobs, applications,
                mock(StudentService.class), mock(CompanyService.class), mock(JobService.class),
                mock(PlacementApplicationService.class));
        DashboardResponse dashboard = service.dashboard();

        assertThat(dashboard.totalStudents()).isEqualTo(2);
        assertThat(dashboard.totalCompanies()).isEqualTo(1);
        assertThat(dashboard.pendingApplications()).isEqualTo(2);
        assertThat(dashboard.rejectedApplications()).isEqualTo(1);
    }
}
