package com.codeblue.goldenhour.controller;

import com.codeblue.goldenhour.dto.FacilityResponse;
import com.codeblue.goldenhour.service.FacilityService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/** docs/API.md 기능 ④ 지금 문 연 곳. 현재는 내 위치 주변 약국만 내려준다 해. */
@RestController
@RequiredArgsConstructor
public class FacilityController {

	private final FacilityService facilityService;

	@GetMapping("/api/v1/facilities/open-now")
	public List<FacilityResponse> openNow(@RequestParam double lat, @RequestParam double lng) {
		return facilityService.findNearbyPharmacies(lat, lng);
	}
}
