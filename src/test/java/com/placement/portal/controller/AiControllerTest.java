package com.placement.portal.controller;

import com.placement.portal.dto.ApiResponse;
import com.placement.portal.dto.AiRequest;
import com.placement.portal.dto.AiResponse;
import com.placement.portal.dto.ResumeAnalysisRequest;
import com.placement.portal.dto.ResumeAnalysisResponse;
import com.placement.portal.service.AiService;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class AiControllerTest {

    @Test
    void askReturnsOkWhenAiServiceSucceeds() {
        AiService aiService = mock(AiService.class);
        when(aiService.ask("Java skills")).thenReturn(new AiResponse(true, "Learn Java 17 and Spring Boot."));

        AiController controller = new AiController(aiService);
        ResponseEntity<ApiResponse<AiResponse>> response = controller.ask(new AiRequest("Java skills"));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().success()).isTrue();
        assertThat(response.getBody().data().getResponse()).isEqualTo("Learn Java 17 and Spring Boot.");
    }

    @Test
    void askReturnsBadGatewayWhenAiServiceFails() {
        AiService aiService = mock(AiService.class);
        when(aiService.ask("Java skills")).thenReturn(new AiResponse(false, "API Key Missing", "API Key Missing"));

        AiController controller = new AiController(aiService);
        ResponseEntity<ApiResponse<AiResponse>> response = controller.ask(new AiRequest("Java skills"));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_GATEWAY);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().success()).isFalse();
    }

    @Test
    void analyzeResumeReturnsOkWhenAiServiceSucceeds() {
        AiService aiService = mock(AiService.class);
        ResumeAnalysisResponse mockResponse = new ResumeAnalysisResponse(true, "Success");
        mockResponse.getSkillsDetected().add("Java");
        when(aiService.analyzeResume("Java Developer profile")).thenReturn(mockResponse);

        AiController controller = new AiController(aiService);
        ResponseEntity<ApiResponse<ResumeAnalysisResponse>> response = controller.analyzeResume(new ResumeAnalysisRequest("Java Developer profile"));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().success()).isTrue();
        assertThat(response.getBody().data().getSkillsDetected()).contains("Java");
    }

    @Test
    void analyzeResumeReturnsBadGatewayWhenAiServiceFails() {
        AiService aiService = mock(AiService.class);
        when(aiService.analyzeResume("Java Developer profile")).thenReturn(new ResumeAnalysisResponse(false, "API Failure"));

        AiController controller = new AiController(aiService);
        ResponseEntity<ApiResponse<ResumeAnalysisResponse>> response = controller.analyzeResume(new ResumeAnalysisRequest("Java Developer profile"));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_GATEWAY);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().success()).isFalse();
    }
}
