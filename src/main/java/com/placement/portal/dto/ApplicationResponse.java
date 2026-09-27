package com.placement.portal.dto;

import com.placement.portal.model.ApplicationStatus;

import java.time.LocalDate;

public record ApplicationResponse(Long id, Long studentId, String studentName, Long jobId,
                                  String jobTitle, Long companyId, String companyName,
                                  LocalDate applicationDate, ApplicationStatus status,
                                  Double matchPercentage) {
}
