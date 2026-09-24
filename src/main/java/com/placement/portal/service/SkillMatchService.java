package com.placement.portal.service;

import java.util.Arrays;
import java.util.Locale;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

@Service
public class SkillMatchService {

    public double calculateMatchPercentage(String studentSkills, String requiredSkills) {
        Set<String> required = skills(requiredSkills);
        if (required.isEmpty()) {
            return 0.0;
        }
        Set<String> student = skills(studentSkills);
        long matches = required.stream().filter(student::contains).count();
        return Math.round((matches * 10000.0) / required.size()) / 100.0;
    }

    private Set<String> skills(String value) {
        if (value == null || value.isBlank()) {
            return Set.of();
        }
        return Arrays.stream(value.split(","))
                .map(skill -> skill.trim().toLowerCase(Locale.ROOT))
                .filter(skill -> !skill.isBlank())
                .collect(Collectors.toSet());
    }
}
