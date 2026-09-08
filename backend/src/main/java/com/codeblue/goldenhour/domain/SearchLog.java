package com.codeblue.goldenhour.domain;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 검색 1회 = 로그 1건. search_result_candidate와 묶어서
 * "직선거리 순위 vs 시간순 순위가 역전되는 사례"를 정량적으로 모으는 용도다 해 (기획 목표 2·3).
 */
@Entity
@Table(name = "search_log")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SearchLog {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(name = "session_id")
	private String sessionId;

	@Column(name = "origin_lat", nullable = false, precision = 9, scale = 6)
	private BigDecimal originLat;

	@Column(name = "origin_lng", nullable = false, precision = 9, scale = 6)
	private BigDecimal originLng;

	@Column(name = "requested_at", nullable = false)
	private LocalDateTime requestedAt;
}
