package com.codeblue.goldenhour.repository;

import com.codeblue.goldenhour.domain.Pharmacy;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PharmacyRepository extends JpaRepository<Pharmacy, Long> {
}
