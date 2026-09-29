package com.codeblue.goldenhour.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 병원 마스터 정보 + 최신 병상현황을 비정규화해서 같이 들고 있는 테이블이다 해.
 * 조회 때마다 bed_status_history를 훑지 않고 여기서 바로 최신 값을 읽으려는 목적이다 해 (P95 1.5초 목표).
 *
 * TODO: 반경검색을 PostGIS ST_DWithin으로 옮길 때 lat/lng 대신
 *       geography(Point, 4326) 컬럼 + GiST 인덱스를 추가한다 해.
 *       지금은 Haversine 계산으로 임시 구현되어 있다 해 (HospitalService 참고).
 */
@Entity
@Table(name = "hospital")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Hospital {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	/** 국립중앙의료원 기관ID (예: A1100043). 공공 API 데이터와 upsert 매칭에 쓴다 해. */
	@Column(unique = true)
	private String hpid;

	@Column(nullable = false)
	private String name;

	@Column(nullable = false)
	private String address;

	@Column(nullable = false, precision = 9, scale = 6)
	private BigDecimal lat;

	@Column(nullable = false, precision = 9, scale = 6)
	private BigDecimal lng;

	private String phone;

	/** 권역응급의료센터 / 지역응급의료센터 / 지역응급의료기관 등 */
	@Column(name = "hospital_type")
	private String hospitalType;

	@Column(name = "latest_general_beds")
	private Integer latestGeneralBeds;

	@Column(name = "latest_pediatric_beds")
	private Integer latestPediatricBeds;

	@Column(name = "latest_icu_beds")
	private Integer latestIcuBeds;

	@Column(name = "beds_updated_at")
	private LocalDateTime bedsUpdatedAt;

	@Column(name = "created_at")
	private LocalDateTime createdAt;
}
