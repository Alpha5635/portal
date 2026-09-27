package com.placement.portal.dto;

public record StudentResponse(Long id, Long userId, String name, String email, String phone,
                              String department, Integer year, String skills, String resumeUrl) {
}
