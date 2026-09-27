package com.placement.portal.repository;

import com.placement.portal.model.PlacementApplication;
import com.placement.portal.model.ApplicationStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PlacementApplicationRepository extends JpaRepository<PlacementApplication, Long> {

    boolean existsByStudentIdAndJobId(Long studentId, Long jobId);

    List<PlacementApplication> findByStudentId(Long studentId);

    List<PlacementApplication> findByJobId(Long jobId);

    long countByStatus(ApplicationStatus status);
}
