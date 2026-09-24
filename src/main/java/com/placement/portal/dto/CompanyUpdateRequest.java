package com.placement.portal.dto;

import jakarta.validation.constraints.Size;

public record CompanyUpdateRequest(
        @Size(max = 150, message = "Company name must be at most 150 characters") String companyName,
        @Size(max = 2000, message = "Description must be at most 2000 characters") String description,
        @Size(max = 150, message = "Location must be at most 150 characters") String location) {
}
