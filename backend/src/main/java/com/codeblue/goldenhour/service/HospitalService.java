package com.codeblue.goldenhour.service;

import com.codeblue.goldenhour.domain.Hospital;
import com.codeblue.goldenhour.dto.HospitalResponse;
import com.codeblue.goldenhour.dto.RecommendResponse;
import com.codeblue.goldenhour.repository.HospitalRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class HospitalService {

	private static final int EARTH_RADIUS_M = 6_371_000;
	private static final double DETOUR_FACTOR = 1.4;
	private static final double AVG_SPEED_MPS = 40_000.0 / 3600.0; // 시속 40km
	private static final double NO_BED_PENALTY_MIN = 30;

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

	/**
	 * 거리순 목록 + 예상 소요시간 기반 종합순 목록.
	 *
	 * 카카오모빌리티 길찾기 API 승인 전이라 ETA는 직선거리 x 우회계수 / 평균속도로 추정한다 해.
	 * 승인되면 estimateEtaSeconds 만 실제 API 호출로 바꾸면 된다 해.
	 */
	public RecommendResponse recommend(double lat, double lng, double radiusKm) {
		List<HospitalResponse> nearby = findNearby(lat, lng, radiusKm).stream()
				.filter(h -> h.getBedsUpdatedAt() != null)
				.toList();

		List<RecommendResponse.Ranked> combined = nearby.stream()
				.map(h -> {
					long eta = estimateEtaSeconds(h.getStraightDistanceM());
					// 점수는 낮을수록 좋다: 예상 분 + 응급실 병상이 없으면 페널티
					double score = eta / 60.0 + (h.getLatestGeneralBeds() != null && h.getLatestGeneralBeds() > 0 ? 0 : NO_BED_PENALTY_MIN);
					return new RecommendResponse.Ranked(h, eta, Math.round(score * 10) / 10.0);
				})
				.sorted(Comparator.comparingDouble(RecommendResponse.Ranked::getCombinedScore))
				.toList();

		return new RecommendResponse(nearby, combined);
	}

	private long estimateEtaSeconds(Double straightDistanceM) {
		double meters = straightDistanceM == null ? 0 : straightDistanceM;
		return Math.round(meters * DETOUR_FACTOR / AVG_SPEED_MPS);
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
