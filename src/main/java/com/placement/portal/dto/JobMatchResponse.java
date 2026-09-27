package com.placement.portal.dto;

import java.util.List;

public class JobMatchResponse {

    private Long jobId;
    private String jobTitle;
    private double matchPercentage;
    private List<String> matchingSkills;
    private List<String> missingSkills;
    private String explanation;

    public JobMatchResponse() {
    }

    public JobMatchResponse(Long jobId, String jobTitle, double matchPercentage,
                            List<String> matchingSkills, List<String> missingSkills, String explanation) {
        this.jobId = jobId;
        this.jobTitle = jobTitle;
        this.matchPercentage = matchPercentage;
        this.matchingSkills = matchingSkills;
        this.missingSkills = missingSkills;
        this.explanation = explanation;
    }

    public Long getJobId() {
        return jobId;
    }

    public void setJobId(Long jobId) {
        this.jobId = jobId;
    }

    public String getJobTitle() {
        return jobTitle;
    }

    public void setJobTitle(String jobTitle) {
        this.jobTitle = jobTitle;
    }

    public double getMatchPercentage() {
        return matchPercentage;
    }

    public void setMatchPercentage(double matchPercentage) {
        this.matchPercentage = matchPercentage;
    }

    public List<String> getMatchingSkills() {
        return matchingSkills;
    }

    public void setMatchingSkills(List<String> matchingSkills) {
        this.matchingSkills = matchingSkills;
    }

    public List<String> getMissingSkills() {
        return missingSkills;
    }

    public void setMissingSkills(List<String> missingSkills) {
        this.missingSkills = missingSkills;
    }

    public String getExplanation() {
        return explanation;
    }

    public void setExplanation(String explanation) {
        this.explanation = explanation;
    }
}
