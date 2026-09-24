package com.placement.portal.dto;

import jakarta.validation.constraints.NotNull;

public record ApplicationCreateRequest(@NotNull(message = "Student ID is required") Long studentId,
                                       @NotNull(message = "Job ID is required") Long jobId) {
}
