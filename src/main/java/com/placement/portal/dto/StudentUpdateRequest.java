package com.placement.portal.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;

public record StudentUpdateRequest(
        @Size(max = 100, message = "Name must be at most 100 characters") String name,
        @Email(message = "Invalid email") @Size(max = 150, message = "Email must be at most 150 characters") String email,
        @Size(max = 20, message = "Phone must be at most 20 characters") String phone,
        @Size(max = 100, message = "Department must be at most 100 characters") String department,
        Integer year,
        @Size(max = 1000, message = "Skills must be at most 1000 characters") String skills,
        @Size(max = 500, message = "Resume URL must be at most 500 characters") String resumeUrl) {
}
