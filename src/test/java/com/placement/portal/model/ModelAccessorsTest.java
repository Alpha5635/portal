package com.placement.portal.model;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;

class ModelAccessorsTest {

    @Test
    void userAccessorsRoundTripValues() {
        User user = new User();
        user.setId(1L);
        user.setName("Ada Lovelace");
        user.setEmail("ada@example.com");
        user.setPassword("secret");
        user.setRole(Role.STUDENT);

        assertThat(user.getId()).isEqualTo(1L);
        assertThat(user.getName()).isEqualTo("Ada Lovelace");
        assertThat(user.getEmail()).isEqualTo("ada@example.com");
        assertThat(user.getPassword()).isEqualTo("secret");
        assertThat(user.getRole()).isEqualTo(Role.STUDENT);
    }

    @Test
    void studentAccessorsRoundTripValues() {
        User user = new User();
        Student student = new Student();
        student.setId(2L);
        student.setUser(user);
        student.setPhone("555-0100");
        student.setDepartment("Computer Science");
        student.setYear(3);
        student.setSkills("Java, SQL");
        student.setResumeUrl("https://example.com/resume");

        assertThat(student.getId()).isEqualTo(2L);
        assertThat(student.getUser()).isSameAs(user);
        assertThat(student.getPhone()).isEqualTo("555-0100");
        assertThat(student.getDepartment()).isEqualTo("Computer Science");
        assertThat(student.getYear()).isEqualTo(3);
        assertThat(student.getSkills()).isEqualTo("Java, SQL");
        assertThat(student.getResumeUrl()).isEqualTo("https://example.com/resume");
    }

    @Test
    void companyAccessorsRoundTripValues() {
        User user = new User();
        Company company = new Company();
        company.setId(3L);
        company.setUser(user);
        company.setCompanyName("Example Labs");
        company.setDescription("Software company");
        company.setLocation("Remote");

        assertThat(company.getId()).isEqualTo(3L);
        assertThat(company.getUser()).isSameAs(user);
        assertThat(company.getCompanyName()).isEqualTo("Example Labs");
        assertThat(company.getDescription()).isEqualTo("Software company");
        assertThat(company.getLocation()).isEqualTo("Remote");
    }

    @Test
    void jobDefaultsToActiveAndAccessorsRoundTripValues() {
        Job job = new Job();
        Company company = new Company();
        LocalDate deadline = LocalDate.of(2026, 12, 31);
        job.setId(4L);
        job.setCompany(company);
        job.setTitle("Java Intern");
        job.setDescription("Build backend services");
        job.setSkillsRequired("Java, Spring");
        job.setLocation("Hybrid");
        job.setSalary(new BigDecimal("1200.00"));
        job.setJobType(JobType.INTERNSHIP);
        job.setDeadline(deadline);

        assertThat(job.getId()).isEqualTo(4L);
        assertThat(job.getCompany()).isSameAs(company);
        assertThat(job.getTitle()).isEqualTo("Java Intern");
        assertThat(job.getDescription()).isEqualTo("Build backend services");
        assertThat(job.getSkillsRequired()).isEqualTo("Java, Spring");
        assertThat(job.getLocation()).isEqualTo("Hybrid");
        assertThat(job.getSalary()).isEqualByComparingTo("1200.00");
        assertThat(job.getJobType()).isEqualTo(JobType.INTERNSHIP);
        assertThat(job.getDeadline()).isEqualTo(deadline);
        assertThat(job.getStatus()).isEqualTo(JobStatus.ACTIVE);

        job.setStatus(JobStatus.CLOSED);
        assertThat(job.getStatus()).isEqualTo(JobStatus.CLOSED);
    }

    @Test
    void placementApplicationDefaultsAndAccessorsWork() {
        PlacementApplication application = new PlacementApplication();
        Student student = new Student();
        Job job = new Job();
        LocalDate date = LocalDate.of(2026, 1, 15);
        application.setId(5L);
        application.setStudent(student);
        application.setJob(job);
        application.setApplicationDate(date);

        assertThat(application.getId()).isEqualTo(5L);
        assertThat(application.getStudent()).isSameAs(student);
        assertThat(application.getJob()).isSameAs(job);
        assertThat(application.getApplicationDate()).isEqualTo(date);
        assertThat(application.getStatus()).isEqualTo(ApplicationStatus.APPLIED);

        application.setStatus(ApplicationStatus.SHORTLISTED);
        assertThat(application.getStatus()).isEqualTo(ApplicationStatus.SHORTLISTED);
    }

    @Test
    void enumsExposeExpectedValues() {
        assertThat(Role.values()).containsExactly(Role.STUDENT, Role.COMPANY, Role.ADMIN);
        assertThat(JobType.values()).containsExactly(JobType.INTERNSHIP, JobType.FULL_TIME,
                JobType.PART_TIME, JobType.CONTRACT);
        assertThat(JobStatus.values()).containsExactly(JobStatus.ACTIVE, JobStatus.CLOSED);
        assertThat(ApplicationStatus.values()).containsExactly(ApplicationStatus.APPLIED,
                ApplicationStatus.SHORTLISTED, ApplicationStatus.REJECTED);
    }
}
