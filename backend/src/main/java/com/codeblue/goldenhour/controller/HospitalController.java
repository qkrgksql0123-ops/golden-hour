package com.codeblue.goldenhour.controller;

import com.codeblue.goldenhour.dto.HospitalResponse;
import com.codeblue.goldenhour.dto.RecommendResponse;
import com.codeblue.goldenhour.service.HospitalService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/** docs/API.md 03절 내부 API 명세 참고. 기능 ① 실시간 응급실 조회. */
@RestController
@RequiredArgsConstructor
public class HospitalController {

	private final HospitalService hospitalService;

	@GetMapping("/api/v1/hospitals/nearby")
	public List<HospitalResponse> nearby(
			@RequestParam double lat,
			@RequestParam double lng,
			@RequestParam(defaultValue = "5") double radiusKm
	) {
		return hospitalService.findNearby(lat, lng, radiusKm);
	}

	@GetMapping("/api/v1/hospitals/recommend")
	public RecommendResponse recommend(
			@RequestParam double lat,
			@RequestParam double lng,
			@RequestParam(defaultValue = "5") double radiusKm
	) {
		return hospitalService.recommend(lat, lng, radiusKm);
	}
}
