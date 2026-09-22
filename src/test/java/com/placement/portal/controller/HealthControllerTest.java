package com.placement.portal.controller;

import com.placement.portal.dto.HealthResponse;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class HealthControllerTest {

    private final HealthController controller = new HealthController();

    @Test
    void healthReturnsSuccessfulResponse() {
        HealthResponse response = controller.health();

        assertThat(response.success()).isTrue();
        assertThat(response.message()).isEqualTo("Backend is running");
    }
}
