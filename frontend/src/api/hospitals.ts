import { apiClient } from "./client";
import type {
  Hospital,
  EtaResult,
  RecommendResult,
  OpenFacility,
  ExternalApiStatus,
} from "../types/hospital";

// docs/API.md 03절의 엔드포인트와 대응한다 해. 백엔드 완성 전까지는
// 각 함수가 던지는 에러를 화면에서 mock 데이터로 대체해서 병렬 개발하면 된다 해.

export async function getNearbyHospitals(
  lat: number,
  lng: number,
  radiusKm = 5
): Promise<Hospital[]> {
  const { data } = await apiClient.get<Hospital[]>("/api/v1/hospitals/nearby", {
    params: { lat, lng, radiusKm },
  });
  return data;
}

export async function getEta(
  origin: { lat: number; lng: number },
  hospitalIds: number[]
): Promise<EtaResult[]> {
  const { data } = await apiClient.post<EtaResult[]>("/api/v1/hospitals/eta", {
    origin,
    hospitalIds,
  });
  return data;
}

export async function getRecommendation(
  lat: number,
  lng: number,
  radiusKm = 5
): Promise<RecommendResult> {
  const { data } = await apiClient.get<RecommendResult>(
    "/api/v1/hospitals/recommend",
    { params: { lat, lng, radiusKm } }
  );
  return data;
}

export async function getOpenFacilitiesNow(
  lat: number,
  lng: number
): Promise<OpenFacility[]> {
  const { data } = await apiClient.get<OpenFacility[]>(
    "/api/v1/facilities/open-now",
    { params: { lat, lng } }
  );
  return data;
}

export async function getHospitalDetail(id: number): Promise<Hospital> {
  const { data } = await apiClient.get<Hospital>(`/api/v1/hospitals/${id}`);
  return data;
}

export async function getExternalApiStatus(): Promise<ExternalApiStatus[]> {
  const { data } = await apiClient.get<ExternalApiStatus[]>(
    "/api/v1/system/external-status"
  );
  return data;
}
