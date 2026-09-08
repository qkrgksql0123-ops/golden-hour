package com.codeblue.goldenhour.domain;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "search_result_candidate")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SearchResultCandidate {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(name = "search_log_id", nullable = false)
	private Long searchLogId;

	@Column(name = "hospital_id", nullable = false)
	private Long hospitalId;

	@Column(name = "straight_distance_m")
	private Integer straightDistanceM;

	@Column(name = "eta_seconds")
	private Integer etaSeconds;

	@Column(name = "available_beds_snapshot")
	private Integer availableBedsSnapshot;

	@Column(name = "distance_rank")
	private Integer distanceRank;

	@Column(name = "eta_rank")
	private Integer etaRank;

	@Column(name = "combined_score", precision = 8, scale = 4)
	private BigDecimal combinedScore;

	@Column(name = "combined_rank")
	private Integer combinedRank;
}
