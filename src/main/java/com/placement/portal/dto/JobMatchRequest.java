package com.placement.portal.dto;

import java.util.List;

public class JobMatchRequest {

    private String jobTitle;
    private double matchPercentage;
    private List<String> matchingSkills;
    private List<String> missingSkills;

    public JobMatchRequest() {
    }

    public JobMatchRequest(String jobTitle, double matchPercentage, List<String> matchingSkills, List<String> missingSkills) {
        this.jobTitle = jobTitle;
        this.matchPercentage = matchPercentage;
        this.matchingSkills = matchingSkills;
        this.missingSkills = missingSkills;
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
}
