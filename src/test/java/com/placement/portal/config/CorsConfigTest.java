package com.placement.portal.config;

import org.junit.jupiter.api.Test;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

class CorsConfigTest {

    @Test
    void configuresApiCorsPolicy() {
        InspectableCorsRegistry registry = new InspectableCorsRegistry();

        new CorsConfig().addCorsMappings(registry);

        Map<String, CorsConfiguration> configurations = registry.configurations();
        CorsConfiguration configuration = configurations.get("/api/**");

        assertThat(configuration).isNotNull();
        assertThat(configuration.getAllowedOrigins()).containsExactly(
                "http://localhost:3000",
                "http://localhost:5500",
                "http://127.0.0.1:5500");
        assertThat(configuration.getAllowedMethods()).containsExactly(
                "GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS");
        assertThat(configuration.getAllowedHeaders()).containsExactly("*");
    }

    private static class InspectableCorsRegistry extends CorsRegistry {

        private Map<String, CorsConfiguration> configurations() {
            return getCorsConfigurations();
        }
    }
}
