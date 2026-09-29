import type { FacilityView } from "../types/view";

// 백엔드 /api/v1/facilities/open-now 완성 전 병렬 개발용 목 데이터다 해.
// 기관명은 전부 가상이며 실제 의료기관 정보가 아니다 해.

export function mockFacilities(): FacilityView[] {
  return [
    { id: 101, name: "밤길정형외과의원", kind: "HOSPITAL", address: "서울 강남구 (예시)", phone: "02-000-0101",
      lat: 37.4979, lng: 127.0331, distanceKm: 0.6, closesAt: "24:00", closed: false },
    { id: 102, name: "한밤약국",         kind: "PHARMACY", address: "서울 강남구 (예시)", phone: "02-000-0102",
      lat: 37.4951, lng: 127.0288, distanceKm: 0.9, closesAt: "02:00", closed: false },
    { id: 103, name: "새벽소아청소년과의원", kind: "HOSPITAL", address: "서울 강남구 (예시)", phone: "02-000-0103",
      lat: 37.5012, lng: 127.0244, distanceKm: 1.2, closesAt: "23:00", closed: false },
    { id: 104, name: "온누리열린약국",    kind: "PHARMACY", address: "서울 강남구 (예시)", phone: "02-000-0104",
      lat: 37.4922, lng: 127.0356, distanceKm: 1.5, closesAt: "22:00", closed: false },
    { id: 105, name: "가온내과의원",      kind: "HOSPITAL", address: "서울 강남구 (예시)", phone: "02-000-0105",
      lat: 37.5038, lng: 127.0367, distanceKm: 2.1, closesAt: "21:30", closed: true },
    { id: 106, name: "달빛약국",         kind: "PHARMACY", address: "서울 강남구 (예시)", phone: "02-000-0106",
      lat: 37.4896, lng: 127.0212, distanceKm: 2.4, closesAt: "23:30", closed: false },
  ];
}
