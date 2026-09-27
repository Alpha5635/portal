package com.placement.portal.controller;

import com.placement.portal.dto.ApiResponse;
import com.placement.portal.dto.JobMatchResponse;
import com.placement.portal.model.Job;
import com.placement.portal.service.AiService;
import com.placement.portal.service.JobService;
import com.placement.portal.service.SkillMatchService;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyDouble;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class JobControllerMatchTest {

    @Test
    void matchReturnsCalculatedJobMatchResponse() {
        JobService jobService = mock(JobService.class);
        SkillMatchService skillMatchService = new SkillMatchService();
        AiService aiService = mock(AiService.class);

        Job mockJob = new Job();
        mockJob.setTitle("Java Developer");
        mockJob.setSkillsRequired("Java, Spring Boot, MySQL");

        when(jobService.getRequired(1L)).thenReturn(mockJob);
        when(aiService.explainJobMatch(anyString(), anyDouble(), anyList(), anyList()))
                .thenReturn("You have great backend skills for this Java Developer role.");

        JobController controller = new JobController(jobService, skillMatchService, null, aiService);
        ApiResponse<JobMatchResponse> response = controller.match(1L, null);

        assertThat(response.success()).isTrue();
        assertThat(response.data()).isNotNull();
        assertThat(response.data().getJobTitle()).isEqualTo("Java Developer");
        assertThat(response.data().getMatchingSkills()).contains("Java", "Spring boot", "Mysql");
        assertThat(response.data().getExplanation()).contains("backend skills");
    }
}
