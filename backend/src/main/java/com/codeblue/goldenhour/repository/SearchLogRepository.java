package com.codeblue.goldenhour.repository;

import com.codeblue.goldenhour.domain.SearchLog;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SearchLogRepository extends JpaRepository<SearchLog, Long> {
}
