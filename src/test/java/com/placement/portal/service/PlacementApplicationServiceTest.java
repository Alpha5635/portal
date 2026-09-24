package com.placement.portal.service;

import com.placement.portal.dto.ApplicationCreateRequest;
import com.placement.portal.repository.CompanyRepository;
import com.placement.portal.repository.JobRepository;
import com.placement.portal.repository.PlacementApplicationRepository;
import com.placement.portal.repository.StudentRepository;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

class PlacementApplicationServiceTest {

    @Test
    void preventsDuplicateApplication() {
        PlacementApplicationRepository applications = mock(PlacementApplicationRepository.class);
        StudentRepository students = mock(StudentRepository.class);
        JobRepository jobs = mock(JobRepository.class);
        com.placement.portal.model.Student student = new com.placement.portal.model.Student();
        student.setId(1L);
        com.placement.portal.model.Job job = new com.placement.portal.model.Job();
        job.setId(2L);
        when(students.findById(1L)).thenReturn(java.util.Optional.of(student));
        when(jobs.findById(2L)).thenReturn(java.util.Optional.of(job));
        when(applications.existsByStudentIdAndJobId(1L, 2L)).thenReturn(true);

        assertThatThrownBy(() -> new PlacementApplicationService(applications, students, jobs,
                mock(CompanyRepository.class), new SkillMatchService()).create(new ApplicationCreateRequest(1L, 2L)))
                .isInstanceOf(com.placement.portal.exception.DuplicateResourceException.class);
    }
}
