package com.placement.portal.dto;

public record AuthResponse(UserResponse user, String message, StudentResponse student) {
    public AuthResponse(UserResponse user, String message) {
        this(user, message, null);
    }
}
