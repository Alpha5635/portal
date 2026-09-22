package com.placement.portal.dto;

import java.time.LocalDateTime;
import java.util.Map;

public record ErrorResponse(boolean success, LocalDateTime timestamp, int status, String message,
							Map<String, String> errors) {

	public ErrorResponse(LocalDateTime timestamp, int status, String message) {
		this(false, timestamp, status, message, Map.of());
	}
}
