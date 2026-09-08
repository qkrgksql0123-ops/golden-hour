package com.codeblue.goldenhour.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * 병상현황 스냅샷 이력이다 해. 60초 단위로 쌓이는 시계열 데이터라
 * hospital 테이블과 분리했다 해 — 갱신 지연 모니터링, 이후 통계용.
 */
@Entity
@Table(name = "bed_status_history")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BedStatusHistory {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(name = "hospital_id", nullable = false)
	private Long hospitalId;

	@Column(name = "general_beds")
	private Integer generalBeds;

	@Column(name = "pediatric_beds")
	private Integer pediatricBeds;

	@Column(name = "icu_beds")
	private Integer icuBeds;

	/** 어떤 외부 API 응답에서 왔는지 (예: NCMC_REALTIME) */
	private String source;

	@Column(name = "recorded_at", nullable = false)
	private LocalDateTime recordedAt;
}
