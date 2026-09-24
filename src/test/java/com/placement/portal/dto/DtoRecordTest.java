package com.placement.portal.dto;

import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;

class DtoRecordTest {

    @Test
    void healthResponseExposesComponents() {
        HealthResponse response = new HealthResponse(true, "Backend is running");

        assertThat(response.success()).isTrue();
        assertThat(response.message()).isEqualTo("Backend is running");
    }

    @Test
    void errorResponseExposesComponents() {
        LocalDateTime timestamp = LocalDateTime.of(2026, 1, 1, 12, 0);
        ErrorResponse response = new ErrorResponse(timestamp, 404, "Missing");

        assertThat(response.timestamp()).isEqualTo(timestamp);
        assertThat(response.status()).isEqualTo(404);
        assertThat(response.message()).isEqualTo("Missing");
    }
}
