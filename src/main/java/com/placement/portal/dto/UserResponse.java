package com.placement.portal.dto;

import com.placement.portal.model.Role;

public record UserResponse(Long id, String name, String email, Role role) {
}
