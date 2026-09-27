package com.placement.portal.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.placement.portal.dto.AiResponse;
import com.placement.portal.dto.ResumeAnalysisResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentMatchers;

import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class AiServiceTest {

    private HttpClient httpClient;
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        httpClient = mock(HttpClient.class);
        objectMapper = new ObjectMapper();
    }

    @Test
    void askReturnsErrorWhenPromptIsEmpty() {
        AiService service = new AiService(httpClient, objectMapper, "test-key");
        AiResponse response = service.ask("");

        assertThat(response.isSuccess()).isFalse();
        assertThat(response.getMessage()).isEqualTo("Empty prompt");
    }

    @Test
    void askReturnsErrorWhenApiKeyIsMissing() {
        AiService service = new AiService(httpClient, objectMapper, "");
        AiResponse response = service.ask("What skills do I need?");

        assertThat(response.isSuccess()).isFalse();
        assertThat(response.getMessage()).isEqualTo("API Key Missing");
    }

    @Test
    @SuppressWarnings("unchecked")
    void askReturnsSuccessWhenGeminiResponds() throws Exception {
        HttpResponse<String> httpResponse = mock(HttpResponse.class);
        when(httpResponse.statusCode()).thenReturn(200);
        when(httpResponse.body()).thenReturn("""
            {
              "candidates": [
                {
                  "content": {
                    "parts": [
                      { "text": "Focus on Java, Spring Boot, and MySQL." }
                    ]
                  }
                }
              ]
            }
            """);

        when(httpClient.send(ArgumentMatchers.any(HttpRequest.class), ArgumentMatchers.<HttpResponse.BodyHandler<String>>any()))
                .thenReturn(httpResponse);

        AiService service = new AiService(httpClient, objectMapper, "test-key");
        AiResponse response = service.ask("What skills should I learn for Java?");

        assertThat(response.isSuccess()).isTrue();
        assertThat(response.getResponse()).contains("Java, Spring Boot, and MySQL");
    }

    @Test
    @SuppressWarnings("unchecked")
    void askHandlesApiFailureGracefully() throws Exception {
        HttpResponse<String> httpResponse = mock(HttpResponse.class);
        when(httpResponse.statusCode()).thenReturn(400);
        when(httpResponse.body()).thenReturn("""
            {
              "error": {
                "message": "Invalid API Key"
              }
            }
            """);

        when(httpClient.send(ArgumentMatchers.any(HttpRequest.class), ArgumentMatchers.<HttpResponse.BodyHandler<String>>any()))
                .thenReturn(httpResponse);

        AiService service = new AiService(httpClient, objectMapper, "bad-key");
        AiResponse response = service.ask("What projects to build?");

        assertThat(response.isSuccess()).isFalse();
        assertThat(response.getResponse()).contains("Invalid API Key");
    }

    @Test
    void analyzeResumeReturnsErrorWhenTextIsEmpty() {
        AiService service = new AiService(httpClient, objectMapper, "test-key");
        ResumeAnalysisResponse response = service.analyzeResume("");

        assertThat(response.isSuccess()).isFalse();
        assertThat(response.getMessage()).contains("cannot be empty");
    }

    @Test
    @SuppressWarnings("unchecked")
    void analyzeResumeParsesStructuredResponse() throws Exception {
        HttpResponse<String> httpResponse = mock(HttpResponse.class);
        when(httpResponse.statusCode()).thenReturn(200);
        when(httpResponse.body()).thenReturn("""
            {
              "candidates": [
                {
                  "content": {
                    "parts": [
                      { "text": "### Skills Detected\\n- Java\\n- Spring Boot\\n\\n### Strengths\\n- Good backend knowledge\\n\\n### Recommended Skills\\n- REST APIs\\n- Git" }
                    ]
                  }
                }
              ]
            }
            """);

        when(httpClient.send(ArgumentMatchers.any(HttpRequest.class), ArgumentMatchers.<HttpResponse.BodyHandler<String>>any()))
                .thenReturn(httpResponse);

        AiService service = new AiService(httpClient, objectMapper, "test-key");
        ResumeAnalysisResponse response = service.analyzeResume("Student skills: Java, Spring Boot.");

        assertThat(response.isSuccess()).isTrue();
        assertThat(response.getSkillsDetected()).contains("Java", "Spring Boot");
        assertThat(response.getStrengths()).contains("Good backend knowledge");
        assertThat(response.getRecommendedSkills()).contains("REST APIs", "Git");
    }
}
