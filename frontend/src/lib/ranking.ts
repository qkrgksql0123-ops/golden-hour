import type { Hospital, RecommendResult } from "../types/hospital";
import type { HospitalView } from "../types/view";

/** ETA 초 → 분. 올림해서 보수적으로 표시한다 해. */
export function etaMinutes(seconds: number): number {
  return Math.max(1, Math.ceil(seconds / 60));
}

function baseView(h: Hospital, distanceRank: number): HospitalView {
  return {
    id: h.id,
    name: h.name,
    address: h.address,
    hospitalType: h.hospitalType,
    phone: h.phone,
    lat: h.lat,
    lng: h.lng,
    distanceKm: (h.straightDistanceM ?? 0) / 1000,
    etaMin: null,
    timeRank: null,
    distanceRank,
    beds: {
      general: h.latestGeneralBeds,
      pediatric: h.latestPediatricBeds,
      icu: h.latestIcuBeds,
    },
    bedsUpdatedAt: h.bedsUpdatedAt,
    bedHistory: h.bedHistory,
  };
}

export interface RankedLists {
  byTime: HospitalView[];
  byDistance: HospitalView[];
  /** ETA를 못 받은 상태. 화면은 거리순으로 고정한다 해. */
  degraded: boolean;
  /** 목록 전체에서 가장 오래된 병상 갱신 시각 */
  oldestUpdatedAt: string | null;
}

/**
 * 백엔드 recommend 응답을 화면용 두 목록으로 바꾼다 해.
 *
 * distanceRanking 과 combinedRanking 을 서버가 둘 다 내려주기 때문에
 * 프론트는 순위 계산 없이 "거리순 N위" 역전 표시를 그릴 수 있다 해.
 */
export function toRankedLists(result: RecommendResult): RankedLists {
  const distanceRankOf = new Map<number, number>();
  result.distanceRanking.forEach((h, i) => distanceRankOf.set(h.id, i + 1));

  const byDistance = result.distanceRanking.map((h, i) => baseView(h, i + 1));

  const combined = result.combinedRanking ?? [];
  const degraded = combined.length === 0;

  const byTime = degraded
    ? byDistance
    : combined.map((h, i) => ({
        ...baseView(h, distanceRankOf.get(h.id) ?? i + 1),
        etaMin: etaMinutes(h.etaSeconds),
        timeRank: i + 1,
      }));

  // ETA를 아는 병원은 거리순 목록에도 시간을 채워 준다 해 (정렬만 다른 같은 데이터라서)
  const etaOf = new Map<number, number>();
  byTime.forEach((v) => {
    if (v.etaMin !== null) etaOf.set(v.id, v.etaMin);
  });
  const byDistanceFilled = byDistance.map((v) => ({
    ...v,
    etaMin: etaOf.get(v.id) ?? null,
  }));

  const all = [...result.distanceRanking];
  const oldestUpdatedAt =
    all.length === 0
      ? null
      : all
          .map((h) => h.bedsUpdatedAt)
          .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())[0];

  return { byTime, byDistance: byDistanceFilled, degraded, oldestUpdatedAt };
}
