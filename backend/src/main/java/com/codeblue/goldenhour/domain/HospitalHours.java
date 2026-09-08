package com.codeblue.goldenhour.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalTime;

/** 병원 요일별 진료시간. 공휴일 여부는 특일정보 API 응답과 조합해서 판단한다 해 (기능 ④). */
@Entity
@Table(name = "hospital_hours")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HospitalHours {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(name = "hospital_id", nullable = false)
	private Long hospitalId;

	/** 0=일요일 ~ 6=토요일 */
	@Column(name = "day_of_week", nullable = false)
	private Short dayOfWeek;

	@Column(name = "open_time")
	private LocalTime openTime;

	@Column(name = "close_time")
	private LocalTime closeTime;

	@Column(name = "is_24h")
	private Boolean is24h;
}
