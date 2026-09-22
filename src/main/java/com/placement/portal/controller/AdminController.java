package com.placement.portal.controller;

import com.placement.portal.dto.ApiResponse;
import com.placement.portal.dto.ApplicationResponse;
import com.placement.portal.dto.CompanyResponse;
import com.placement.portal.dto.DashboardResponse;
import com.placement.portal.dto.JobResponse;
import com.placement.portal.dto.StudentResponse;
import com.placement.portal.service.AdminService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/students")
    public ApiResponse<List<StudentResponse>> students() {
        return new ApiResponse<>(true, "Students retrieved", adminService.students());
    }

    @GetMapping("/companies")
    public ApiResponse<List<CompanyResponse>> companies() {
        return new ApiResponse<>(true, "Companies retrieved", adminService.companies());
    }

    @GetMapping("/jobs")
    public ApiResponse<List<JobResponse>> jobs() {
        return new ApiResponse<>(true, "Jobs retrieved", adminService.jobs());
    }

    @GetMapping("/applications")
    public ApiResponse<List<ApplicationResponse>> applications() {
        return new ApiResponse<>(true, "Applications retrieved", adminService.applications());
    }

    @GetMapping("/dashboard")
    public ApiResponse<DashboardResponse> dashboard() {
        return new ApiResponse<>(true, "Dashboard statistics retrieved", adminService.dashboard());
    }
}
