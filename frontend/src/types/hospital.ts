// 골든아워 도메인 타입 정의
// docs/API.md 의 내부 API 명세와 1:1로 맞춰져 있다 해. 백엔드 응답 필드가 바뀌면 여기부터 고친다 해.

export interface Hospital {
  id: number;
  name: string;
  address: string;
  lat: number;
  lng: number;
  phone: string;
  hospitalType: string;
  latestGeneralBeds: number;
  latestPediatricBeds: number;
  latestIcuBeds: number;
  bedsUpdatedAt: string; // ISO datetime
  straightDistanceM?: number;
  /**
   * 최근 일반 병상 수 이력 (도착 시점 예측용).
   *
   * TODO(백엔드): 아직 /nearby, /recommend, /{id} 응답에 없는 필드다 해.
   * backend의 bed_status_history 테이블을 최근 N개 내려주는 식으로 추가하면 된다 해.
   * 그 전까지 프론트는 mocks/recommend.ts의 가짜 이력으로 예측 기능을 시연한다 해.
   */
  bedHistory?: BedHistoryPoint[];
}

export interface BedHistoryPoint {
  recordedAt: string; // ISO datetime
  general: number;
}

export interface EtaResult {
  hospitalId: number;
  etaSeconds: number;
}

export interface RecommendResult {
  distanceRanking: Hospital[];
  combinedRanking: (Hospital & {
    etaSeconds: number;
    combinedScore: number;
  })[];
}

export interface OpenFacility {
  id: number;
  name: string;
  type: "HOSPITAL" | "PHARMACY";
  address: string;
  phone: string;
  lat: number;
  lng: number;
}

export interface ExternalApiStatus {
  apiName: string;
  lastSuccessAt: string | null;
  healthy: boolean;
}
