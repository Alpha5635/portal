package com.placement.portal.controller;

import com.placement.portal.dto.ApiResponse;
import com.placement.portal.dto.CompanyResponse;
import com.placement.portal.dto.CompanyUpdateRequest;
import com.placement.portal.service.CompanyService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/companies")
public class CompanyController {

    private final CompanyService companyService;

    public CompanyController(CompanyService companyService) {
        this.companyService = companyService;
    }

    @GetMapping("/{id}")
    public ApiResponse<CompanyResponse> get(@PathVariable Long id) {
        return new ApiResponse<>(true, "Company profile retrieved", companyService.getProfile(id));
    }

    @PutMapping("/{id}")
    public ApiResponse<CompanyResponse> update(@PathVariable Long id,
                                                @Valid @RequestBody CompanyUpdateRequest request) {
        return new ApiResponse<>(true, "Company profile updated", companyService.update(id, request));
    }
}
