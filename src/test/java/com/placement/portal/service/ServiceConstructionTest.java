package com.placement.portal.service;

import com.placement.portal.repository.CompanyRepository;
import com.placement.portal.repository.JobRepository;
import com.placement.portal.repository.PlacementApplicationRepository;
import com.placement.portal.repository.StudentRepository;
import com.placement.portal.repository.UserRepository;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.mockito.Mockito.mock;

class ServiceConstructionTest {

    @Test
    void serviceConstructorsAcceptTheirRepositories() {
        assertThatCode(() -> new UserService(mock(UserRepository.class))).doesNotThrowAnyException();
        assertThatCode(() -> new StudentService(mock(StudentRepository.class))).doesNotThrowAnyException();
        assertThatCode(() -> new CompanyService(mock(CompanyRepository.class))).doesNotThrowAnyException();
        assertThatCode(() -> new JobService(mock(JobRepository.class))).doesNotThrowAnyException();
        assertThatCode(() -> new PlacementApplicationService(mock(PlacementApplicationRepository.class)))
                .doesNotThrowAnyException();
    }
}
