package com.placement.portal.dto;

public record ApiResponse<T>(boolean success, String message, T data) {
}
