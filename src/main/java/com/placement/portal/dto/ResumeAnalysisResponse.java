package com.placement.portal.dto;

import java.util.ArrayList;
import java.util.List;

public class ResumeAnalysisResponse {

    private boolean success;
    private String message;
    private int atsScore = 75;
    private String summary = "";
    private List<String> skillsDetected = new ArrayList<>();
    private List<String> strengths = new ArrayList<>();
    private List<String> lackingPoints = new ArrayList<>();
    private List<String> recommendedSkills = new ArrayList<>();
    private List<String> improvementSuggestions = new ArrayList<>();
    private List<String> suggestedProjects = new ArrayList<>();
    private List<String> careerDirections = new ArrayList<>();
    private List<String> suggestedOpportunities = new ArrayList<>();
    private String rawAnalysis;

    public ResumeAnalysisResponse() {
    }

    public ResumeAnalysisResponse(boolean success, String message) {
        this.success = success;
        this.message = message;
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public List<String> getSkillsDetected() {
        return skillsDetected;
    }

    public void setSkillsDetected(List<String> skillsDetected) {
        this.skillsDetected = skillsDetected != null ? skillsDetected : new ArrayList<>();
    }

    public List<String> getStrengths() {
        return strengths;
    }

    public void setStrengths(List<String> strengths) {
        this.strengths = strengths != null ? strengths : new ArrayList<>();
    }

    public List<String> getRecommendedSkills() {
        return recommendedSkills;
    }

    public void setRecommendedSkills(List<String> recommendedSkills) {
        this.recommendedSkills = recommendedSkills != null ? recommendedSkills : new ArrayList<>();
    }

    public List<String> getImprovementSuggestions() {
        return improvementSuggestions;
    }

    public void setImprovementSuggestions(List<String> improvementSuggestions) {
        this.improvementSuggestions = improvementSuggestions != null ? improvementSuggestions : new ArrayList<>();
    }

    public List<String> getSuggestedProjects() {
        return suggestedProjects;
    }

    public void setSuggestedProjects(List<String> suggestedProjects) {
        this.suggestedProjects = suggestedProjects != null ? suggestedProjects : new ArrayList<>();
    }

    public List<String> getCareerDirections() {
        return careerDirections;
    }

    public void setCareerDirections(List<String> careerDirections) {
        this.careerDirections = careerDirections != null ? careerDirections : new ArrayList<>();
    }

    public int getAtsScore() {
        return atsScore;
    }

    public void setAtsScore(int atsScore) {
        this.atsScore = atsScore;
    }

    public String getSummary() {
        return summary;
    }

    public void setSummary(String summary) {
        this.summary = summary;
    }

    public List<String> getLackingPoints() {
        return lackingPoints;
    }

    public void setLackingPoints(List<String> lackingPoints) {
        this.lackingPoints = lackingPoints != null ? lackingPoints : new ArrayList<>();
    }

    public List<String> getSuggestedOpportunities() {
        return suggestedOpportunities;
    }

    public void setSuggestedOpportunities(List<String> suggestedOpportunities) {
        this.suggestedOpportunities = suggestedOpportunities != null ? suggestedOpportunities : new ArrayList<>();
    }

    public String getRawAnalysis() {
        return rawAnalysis;
    }

    public void setRawAnalysis(String rawAnalysis) {
        this.rawAnalysis = rawAnalysis;
    }
}
