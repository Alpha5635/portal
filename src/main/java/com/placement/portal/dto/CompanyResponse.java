package com.placement.portal.dto;

public record CompanyResponse(Long id, Long userId, String companyName, String description, String location) {
}
