// 화면 전용 뷰 모델.
// 백엔드 응답 타입(hospital.ts)은 그대로 두고, 화면에서 쓰기 편한 형태로 한 번 변환한다 해.
// 서버 필드가 바뀌어도 lib/ranking.ts 만 고치면 컴포넌트는 그대로다 해.

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
}

export type BedState = "ok" | "tight" | "full";

export function bedStateOf(general: number): BedState {
  if (general === 0) return "full";
  if (general < 3) return "tight";
  return "ok";
}
