package com.placement.portal.dto;

public record DashboardResponse(long totalStudents, long totalCompanies, long totalJobs,
                                long totalApplications, long shortlistedApplications,
                                long pendingApplications, long rejectedApplications) {
}
