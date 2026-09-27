package com.placement.portal.dto;

import jakarta.validation.constraints.NotBlank;

public class ResumeAnalysisRequest {

    @NotBlank(message = "Resume content or profile text cannot be empty")
    private String resumeText;

    public ResumeAnalysisRequest() {
    }

    public ResumeAnalysisRequest(String resumeText) {
        this.resumeText = resumeText;
    }

    public String getResumeText() {
        return resumeText;
    }

    public void setResumeText(String resumeText) {
        this.resumeText = resumeText;
    }
}
