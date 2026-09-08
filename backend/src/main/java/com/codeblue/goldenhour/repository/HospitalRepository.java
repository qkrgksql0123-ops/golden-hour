package com.codeblue.goldenhour.repository;

import com.codeblue.goldenhour.domain.Hospital;
import org.springframework.data.jpa.repository.JpaRepository;

public interface HospitalRepository extends JpaRepository<Hospital, Long> {
}
