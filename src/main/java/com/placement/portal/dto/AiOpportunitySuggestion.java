package com.placement.portal.dto;

import java.util.List;

public record AiOpportunitySuggestion(
        String title,
        String company,
        String branch,
        String location,
        String mode,
        String type,
        String salary,
        String duration,
        List<String> skills,
        String description
) {
}
