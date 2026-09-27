package com.placement.portal.service;

import com.placement.portal.dto.JobRequest;
import com.placement.portal.dto.JobResponse;
import com.placement.portal.model.Company;
import com.placement.portal.model.JobType;
import com.placement.portal.model.User;
import com.placement.portal.model.Role;
import com.placement.portal.repository.CompanyRepository;
import com.placement.portal.repository.JobRepository;
import com.placement.portal.repository.StudentRepository;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class JobServiceTest {

    @Test
    void createsActiveJobForCompany() {
        JobRepository jobs = mock(JobRepository.class);
        CompanyRepository companies = mock(CompanyRepository.class);
        StudentRepository students = mock(StudentRepository.class);
        Company company = new Company();
        company.setId(4L);
        company.setCompanyName("Acme");
        User user = new User();
        user.setId(8L);
        company.setUser(user);
        when(companies.findById(4L)).thenReturn(Optional.of(company));
        when(jobs.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        JobResponse response = new JobService(jobs, companies, new SkillMatchService(), students).create(
                new JobRequest(4L, "Java Intern", "Build APIs", "Java, SQL", "Remote", null,
                        JobType.INTERNSHIP, LocalDate.now(), null));

        assertThat(response.status()).isEqualTo(com.placement.portal.model.JobStatus.ACTIVE);
        assertThat(response.companyName()).isEqualTo("Acme");
    }
}
