package com.placement.portal.dto;

import com.placement.portal.model.ApplicationStatus;
import jakarta.validation.constraints.NotNull;

public record ApplicationStatusRequest(@NotNull(message = "Company ID is required") Long companyId,
                                       @NotNull(message = "Status is required") ApplicationStatus status) {
}
