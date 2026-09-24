package com.placement.portal.dto;

import com.placement.portal.model.JobStatus;
import com.placement.portal.model.JobType;

import java.math.BigDecimal;
import java.time.LocalDate;

public record JobResponse(Long id, Long companyId, String companyName, String title, String description,
                          String skillsRequired, String location, BigDecimal salary, JobType jobType,
                          LocalDate deadline, JobStatus status, Double matchPercentage) {
}
