package com.placement.portal.controller;

import com.placement.portal.dto.ApiResponse;
import com.placement.portal.dto.AiRequest;
import com.placement.portal.dto.AiResponse;
import com.placement.portal.dto.ResumeAnalysisRequest;
import com.placement.portal.dto.ResumeAnalysisResponse;
import com.placement.portal.service.AiService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/ai")
public class AiController {

    private final AiService aiService;

    public AiController(AiService aiService) {
        this.aiService = aiService;
    }

    @PostMapping("/ask")
    public ResponseEntity<ApiResponse<AiResponse>> ask(@Valid @RequestBody AiRequest request) {
        AiResponse result = aiService.ask(request.getPrompt());
        if (!result.isSuccess()) {
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                    .body(new ApiResponse<>(false, result.getMessage(), result));
        }
        return ResponseEntity.ok(new ApiResponse<>(true, "AI response generated successfully", result));
    }

    @PostMapping("/resume-analyze")
    public ResponseEntity<ApiResponse<ResumeAnalysisResponse>> analyzeResume(
            @Valid @RequestBody ResumeAnalysisRequest request) {
        ResumeAnalysisResponse result = aiService.analyzeResume(request.getResumeText());
        if (!result.isSuccess()) {
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                    .body(new ApiResponse<>(false, result.getMessage(), result));
        }
        return ResponseEntity.ok(new ApiResponse<>(true, "Resume analysis completed successfully", result));
    }

    @PostMapping("/suggest-opportunities")
    public ResponseEntity<ApiResponse<java.util.List<com.placement.portal.dto.AiOpportunitySuggestion>>> suggestOpportunities(
            @RequestBody com.placement.portal.dto.OpportunitySuggestionRequest request) {
        java.util.List<com.placement.portal.dto.AiOpportunitySuggestion> suggestions = aiService.suggestOpportunities(request);
        return ResponseEntity.ok(new ApiResponse<>(true, "AI suggested opportunities generated successfully", suggestions));
    }
}
