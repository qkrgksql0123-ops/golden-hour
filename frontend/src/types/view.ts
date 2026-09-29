// 화면 전용 뷰 모델.
// 백엔드 응답 타입(hospital.ts)은 그대로 두고, 화면에서 쓰기 편한 형태로 한 번 변환한다 해.
// 서버 필드가 바뀌어도 lib/ranking.ts 만 고치면 컴포넌트는 그대로다 해.

import type { BedHistoryPoint } from "./hospital";

export type SortMode = "time" | "distance";

export interface HospitalView {
  id: number;
  name: string;
  address: string;
  hospitalType: string;
  phone: string;
  lat: number;
  lng: number;
  /** 직선거리 (km) */
  distanceKm: number;
  /** 도착 예상 시간 (분). 폴백 상태에서는 null */
  etaMin: number | null;
  /** 결합점수 기준 순위 (1부터). 폴백 상태에서는 null */
  timeRank: number | null;
  /** 직선거리 기준 순위 (1부터) */
  distanceRank: number;
  beds: {
    general: number;
    pediatric: number;
    icu: number;
  };
  bedsUpdatedAt: string;
  /** 도착 시점 병상예측용 이력. 없으면 예측 불가 */
  bedHistory?: BedHistoryPoint[];
}

export type BedState = "ok" | "tight" | "full";

export function bedStateOf(general: number): BedState {
  if (general === 0) return "full";
  if (general < 3) return "tight";
  return "ok";
}

/* ---------- 지도 공용 ---------- */

/**
 * 지도에 찍히는 점 하나.
 * 응급실 화면과 야간 진료 화면이 같은 지도 컴포넌트를 쓰도록 공통 형태로 맞춘다 해.
 */
export interface MapPoint {
  id: number;
  name: string;
  lat: number;
  lng: number;
  /** 핀 색 */
  tone: BedState;
  /** 핀 위에 붙는 짧은 라벨 (예: "8분", "~24시") */
  label: string;
}

/* ---------- 야간 진료 (기능 ④) ---------- */

export type FacilityKind = "HOSPITAL" | "PHARMACY";

export interface FacilityView {
  id: number;
  name: string;
  kind: FacilityKind;
  address: string;
  phone: string;
  lat: number;
  lng: number;
  /** 직선거리 (km). 서버가 안 주면 null */
  distanceKm: number | null;
  /**
   * 오늘 진료/영업 종료 시각 "HH:mm".
   *
   * TODO(백엔드): /api/v1/facilities/open-now 응답에 아래 두 필드를 추가해달라 해.
   *   - closesAt: "22:00"  (요일·공휴일·점심시간 판정 결과)
   *   - distanceM: number
   * 지금은 목 데이터로 채워 두고 화면을 먼저 완성했다 해.
   */
  closesAt: string | null;
  /** 이미 문을 닫았는지 */
  closed: boolean;
}
