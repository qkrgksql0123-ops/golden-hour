package com.codeblue.goldenhour.service;

import com.codeblue.goldenhour.domain.Hospital;
import com.codeblue.goldenhour.dto.HospitalResponse;
import com.codeblue.goldenhour.repository.HospitalRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class HospitalService {

	private static final int EARTH_RADIUS_M = 6_371_000;

	private final HospitalRepository hospitalRepository;

	/**
	 * 반경 내 병원을 직선거리순으로 반환한다 해.
	 *
	 * TODO(성능): 지금은 전체 테이블을 읽어서 자바에서 Haversine 계산 후 거른다 해.
	 * 병원 수가 늘어나면 PostGIS ST_DWithin + GiST 인덱스로 DB 레벨 필터링으로 옮겨야 한다 해.
	 * (docs/API.md, docs/ERD.md의 TODO 참고)
	 */
	public List<HospitalResponse> findNearby(double lat, double lng, double radiusKm) {
		double radiusM = radiusKm * 1000;

		return hospitalRepository.findAll().stream()
				.map(h -> toResponseWithDistance(h, lat, lng))
				.filter(r -> r.getStraightDistanceM() != null && r.getStraightDistanceM() <= radiusM)
				.sorted(Comparator.comparingDouble(HospitalResponse::getStraightDistanceM))
				.toList();
	}

	private HospitalResponse toResponseWithDistance(Hospital h, double lat, double lng) {
		double distance = haversineMeters(
				lat, lng,
				h.getLat().doubleValue(), h.getLng().doubleValue()
		);

		return HospitalResponse.builder()
				.id(h.getId())
				.name(h.getName())
				.address(h.getAddress())
				.lat(h.getLat())
				.lng(h.getLng())
				.phone(h.getPhone())
				.hospitalType(h.getHospitalType())
				.latestGeneralBeds(h.getLatestGeneralBeds())
				.latestPediatricBeds(h.getLatestPediatricBeds())
				.latestIcuBeds(h.getLatestIcuBeds())
				.bedsUpdatedAt(h.getBedsUpdatedAt())
				.straightDistanceM(distance)
				.build();
	}

	private double haversineMeters(double lat1, double lng1, double lat2, double lng2) {
		double dLat = Math.toRadians(lat2 - lat1);
		double dLng = Math.toRadians(lng2 - lng1);

		double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
				+ Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
				* Math.sin(dLng / 2) * Math.sin(dLng / 2);
		double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

		return EARTH_RADIUS_M * c;
	}
}
