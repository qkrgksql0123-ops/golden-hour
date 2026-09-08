package com.codeblue.goldenhour.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/** docs/API.md 03절 GET /api/v1/hospitals/nearby 응답 형태와 맞춘다 해. */
@Getter
@Builder
@AllArgsConstructor
public class HospitalResponse {
	private Long id;
	private String name;
	private String address;
	private BigDecimal lat;
	private BigDecimal lng;
	private String phone;
	private String hospitalType;
	private Integer latestGeneralBeds;
	private Integer latestPediatricBeds;
	private Integer latestIcuBeds;
	private LocalDateTime bedsUpdatedAt;
	private Double straightDistanceM;
}
