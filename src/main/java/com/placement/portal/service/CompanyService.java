package com.placement.portal.service;

import com.placement.portal.dto.CompanyResponse;
import com.placement.portal.dto.CompanyUpdateRequest;
import com.placement.portal.exception.ResourceNotFoundException;
import com.placement.portal.model.Company;
import com.placement.portal.repository.CompanyRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CompanyService {

    private final CompanyRepository companyRepository;

    public CompanyService(CompanyRepository companyRepository) {
        this.companyRepository = companyRepository;
    }

    public Company getRequired(Long id) {
        return companyRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Company not found"));
    }

    public CompanyResponse getProfile(Long id) {
        return toResponse(getRequired(id));
    }

    public CompanyResponse update(Long id, CompanyUpdateRequest request) {
        Company company = getRequired(id);
        if (request.companyName() != null) company.setCompanyName(request.companyName().trim());
        if (request.description() != null) company.setDescription(request.description());
        if (request.location() != null) company.setLocation(request.location());
        return toResponse(companyRepository.save(company));
    }

    public List<CompanyResponse> list() {
        return companyRepository.findAll().stream().map(this::toResponse).toList();
    }

    public CompanyResponse toResponse(Company company) {
        return new CompanyResponse(company.getId(), company.getUser().getId(), company.getCompanyName(),
                company.getDescription(), company.getLocation());
    }
}
