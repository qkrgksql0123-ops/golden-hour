import type { BedHistoryPoint, RecommendResult } from "../types/hospital";

// 백엔드 완성 전 병렬 개발용 목 데이터다 해.
// 병원 이름과 병상 수는 전부 가상이며 실제 의료기관 정보가 아니다 해.
//
// 한빛대학교병원이 직선거리 1위지만 하천 건너편이라 ETA는 4위다 해.
// 이 역전이 서비스의 존재 이유라서 목 데이터에도 일부러 넣어 두었다 해.

const NOW = () => new Date(Date.now() - 60_000).toISOString();

// trend: 최근 45분간 15분마다 일반 병상이 변한 수 (음수 = 감소 추세).
// 도착시점 병상예측(기능 미정의 신규) 시연용 가짜 이력을 여기서 만든다 해.
const RAW = [
  { id: 1, name: "새길종합병원",   type: "지역응급의료센터", lat: 37.4921, lng: 127.0448, m: 2400, g: 4, p: 1, i: 2, eta: 480,  trend: -1 },
  { id: 2, name: "미래로병원",     type: "지역응급의료기관", lat: 37.4988, lng: 127.0121, m: 3100, g: 6, p: 2, i: 1, eta: 720,  trend: 0 },
  { id: 3, name: "중앙제일병원",   type: "지역응급의료기관", lat: 37.4772, lng: 127.0662, m: 5200, g: 3, p: 0, i: 0, eta: 900,  trend: -1 },
  { id: 4, name: "한빛대학교병원", type: "권역응급의료센터", lat: 37.5162, lng: 127.0301, m: 1600, g: 1, p: 0, i: 1, eta: 1080, trend: 1 },
  { id: 5, name: "정한의료원",     type: "지역응급의료기관", lat: 37.5204, lng: 127.0455, m: 2900, g: 0, p: 0, i: 0, eta: 1260, trend: 0 },
];

/** 15분 간격 4개 지점(-45,-30,-15,0분)으로 최근 병상 추세를 만든다 해. */
function bedHistoryOf(r: (typeof RAW)[number]): BedHistoryPoint[] {
  const nowMs = Date.now() - 60_000;
  return [3, 2, 1, 0].map((stepsAgo) => ({
    recordedAt: new Date(nowMs - stepsAgo * 15 * 60_000).toISOString(),
    general: Math.max(0, r.g + r.trend * stepsAgo),
  }));
}

function hospital(r: (typeof RAW)[number]) {
  return {
    id: r.id,
    name: r.name,
    address: "서울 강남구 (예시 데이터)",
    lat: r.lat,
    lng: r.lng,
    phone: "02-000-0000",
    hospitalType: r.type,
    latestGeneralBeds: r.g,
    latestPediatricBeds: r.p,
    latestIcuBeds: r.i,
    bedsUpdatedAt: NOW(),
    straightDistanceM: r.m,
    bedHistory: bedHistoryOf(r),
  };
}

export function mockRecommend(): RecommendResult {
  return {
    distanceRanking: [...RAW]
      .sort((a, b) => a.m - b.m)
      .map(hospital),
    combinedRanking: [...RAW]
      .sort((a, b) => a.eta - b.eta)
      .map((r) => ({
        ...hospital(r),
        etaSeconds: r.eta,
        combinedScore: Math.round((1000 / r.eta) * (r.g + 1) * 100) / 100,
      })),
  };
}

/** ETA를 못 받은 장애 상황 재현용. combinedRanking 이 비어 있다 해. */
export function mockDegraded(): RecommendResult {
  return { distanceRanking: mockRecommend().distanceRanking, combinedRanking: [] };
}
