package com.placement.portal.dto;

import com.placement.portal.model.JobStatus;
import com.placement.portal.model.JobType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

public record JobRequest(
        @NotNull(message = "Company ID is required") Long companyId,
        @NotBlank(message = "Title is required") @Size(max = 150, message = "Title must be at most 150 characters") String title,
        @NotBlank(message = "Description is required") @Size(max = 5000, message = "Description must be at most 5000 characters") String description,
        @NotBlank(message = "Required skills are required") @Size(max = 1000, message = "Required skills must be at most 1000 characters") String skillsRequired,
        @NotBlank(message = "Location is required") @Size(max = 150, message = "Location must be at most 150 characters") String location,
        @DecimalMin(value = "0.0", message = "Salary cannot be negative") BigDecimal salary,
        @NotNull(message = "Job type is required") JobType jobType,
        @NotNull(message = "Deadline is required") @FutureOrPresent(message = "Deadline must be today or in the future") LocalDate deadline,
        JobStatus status) {
}
