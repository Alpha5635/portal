package com.placement.portal.service;

import java.util.Arrays;
import java.util.List;
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

    public List<String> getMatchingSkills(String studentSkills, String requiredSkills) {
        Set<String> student = skills(studentSkills);
        Set<String> required = skills(requiredSkills);
        if (required.isEmpty()) {
            return List.of();
        }
        return required.stream()
                .filter(student::contains)
                .map(this::capitalize)
                .collect(Collectors.toList());
    }

    public List<String> getMissingSkills(String studentSkills, String requiredSkills) {
        Set<String> student = skills(studentSkills);
        Set<String> required = skills(requiredSkills);
        if (required.isEmpty()) {
            return List.of();
        }
        return required.stream()
                .filter(skill -> !student.contains(skill))
                .map(this::capitalize)
                .collect(Collectors.toList());
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

    private String capitalize(String skill) {
        if (skill == null || skill.isBlank()) {
            return "";
        }
        if (skill.length() == 1) {
            return skill.toUpperCase(Locale.ROOT);
        }
        return Character.toUpperCase(skill.charAt(0)) + skill.substring(1);
    }
}
