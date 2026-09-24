package com.placement.portal.service;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class SkillMatchServiceTest {

    private final SkillMatchService service = new SkillMatchService();

    @Test
    void calculatesFullMatch() {
        assertThat(service.calculateMatchPercentage("Java, SQL, Spring Boot", "Java, SQL, Spring Boot"))
                .isEqualTo(100.0);
    }

    @Test
    void calculatesPartialMatch() {
        assertThat(service.calculateMatchPercentage("Java, HTML", "Java, SQL, Spring Boot"))
                .isEqualTo(33.33);
    }
}
