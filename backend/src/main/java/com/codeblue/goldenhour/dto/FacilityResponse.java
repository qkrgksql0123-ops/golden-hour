package com.codeblue.goldenhour.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

/** docs/API.md GET /api/v1/facilities/open-now 응답. 프론트 types/hospital.ts OpenFacility 와 맞춘다 해. */
@Getter
@AllArgsConstructor
public class FacilityResponse {
	private Long id;
	private String name;
	private String type; // HOSPITAL | PHARMACY
	private String address;
	private String phone;
	private double lat;
	private double lng;
	private Double distanceM;
	/** 영업 종료 시각(HH:mm). 카카오 로컬 API는 영업시간을 주지 않아서 null 이다 해. */
	private String closesAt;
}
