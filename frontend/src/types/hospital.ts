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
