import type { BedHistoryPoint } from "../types/hospital";

export type PredictConfidence = "high" | "medium" | "low" | "unknown";

export interface BedPrediction {
  /** 도착 시점 예상 일반 병상 수. 계산 불가면 null */
  predictedGeneral: number | null;
  /** 분당 병상 변화량 (음수 = 감소 추세). 계산 불가면 null */
  trendPerMin: number | null;
  confidence: PredictConfidence;
}

const UNKNOWN: BedPrediction = { predictedGeneral: null, trendPerMin: null, confidence: "unknown" };

/**
 * 최근 병상 이력의 추세를 선형회귀로 연장해 도착 시점(etaMin 분 후) 예상 병상 수를 계산한다 해.
 *
 * TODO(백엔드): /api/v1/hospitals/recommend, /api/v1/hospitals/{id} 응답에
 * 최근 병상 이력(bedHistory)이 아직 없다 해. 지금은 mocks/recommend.ts의
 * 가짜 이력으로만 동작하고, 실제 이력이 내려오기 시작하면 이 함수는 그대로 쓸 수 있다 해.
 * (원본 데이터는 backend/.../domain/BedStatusHistory.java에 이미 쌓이고 있다 해)
 */
export function predictBedsAtArrival(
  history: BedHistoryPoint[] | undefined,
  currentGeneral: number,
  etaMin: number | null
): BedPrediction {
  if (etaMin === null) return UNKNOWN;

  if (!history || history.length < 2) {
    // 이력이 없으면 추세를 알 수 없다 해. 현재 값을 그대로 보여주되 신뢰도는 낮게 표시한다 해.
    return { predictedGeneral: currentGeneral, trendPerMin: null, confidence: "low" };
  }

  const sorted = [...history].sort(
    (a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime()
  );
  const t0 = new Date(sorted[0].recordedAt).getTime();
  const points = sorted.map((p) => ({
    x: (new Date(p.recordedAt).getTime() - t0) / 60_000, // 분 단위 경과시간
    y: p.general,
  }));

  const n = points.length;
  const sumX = points.reduce((s, p) => s + p.x, 0);
  const sumY = points.reduce((s, p) => s + p.y, 0);
  const sumXY = points.reduce((s, p) => s + p.x * p.y, 0);
  const sumXX = points.reduce((s, p) => s + p.x * p.x, 0);
  const denom = n * sumXX - sumX * sumX;

  const slope = denom === 0 ? 0 : (n * sumXY - sumX * sumY) / denom;
  const intercept = (sumY - slope * sumX) / n;

  const lastX = points[n - 1].x;
  const futureX = lastX + etaMin;
  const predictedGeneral = Math.max(0, Math.round(intercept + slope * futureX));

  const spanMin = lastX - points[0].x;
  const confidence: PredictConfidence = spanMin >= 30 && n >= 3 ? "high" : spanMin >= 10 ? "medium" : "low";

  return { predictedGeneral, trendPerMin: slope, confidence };
}
