package com.codeblue.goldenhour.dto;

import com.fasterxml.jackson.annotation.JsonUnwrapped;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

/** docs/API.md GET /api/v1/hospitals/recommend 응답. 프론트 types/hospital.ts RecommendResult 와 맞춘다 해. */
@Getter
@AllArgsConstructor
public class RecommendResponse {

	private List<HospitalResponse> distanceRanking;
	private List<Ranked> combinedRanking;

	@Getter
	@AllArgsConstructor
	public static class Ranked {
		@JsonUnwrapped
		private HospitalResponse hospital;
		private long etaSeconds;
		private double combinedScore;
	}
}
