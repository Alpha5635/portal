package com.placement.portal.dto;

public record OpportunitySuggestionRequest(
        String branch,
        String location,
        String skills,
        String workMode,
        String type
) {
}
