import { useEffect, useState } from "react";
import { getRecommendation } from "../api/hospitals";
import { mockRecommend } from "../mocks/recommend";
import { toRankedLists, type RankedLists } from "../lib/ranking";

const REFRESH_MS = 30_000;

export interface RecommendState extends RankedLists {
  loading: boolean;
  /** 백엔드를 못 붙어서 목 데이터를 쓰는 중이다 해 */
  usingMock: boolean;
}

const EMPTY: RankedLists = { byTime: [], byDistance: [], degraded: false, oldestUpdatedAt: null };

/**
 * 추천 목록 조회 + 30초 자동 갱신.
 *
 * 백엔드가 아직 없거나 죽어 있으면 목 데이터로 넘어간다 해.
 * docs/API.md 에 적힌 "백엔드 완성 전까지 mock 으로 병렬 개발" 방식을 그대로 구현한 것이다 해.
 */
export function useRecommendation(lat: number, lng: number): RecommendState {
  const [state, setState] = useState<RecommendState>({
    ...EMPTY,
    loading: true,
    usingMock: false,
  });

  useEffect(() => {
    let alive = true;

    async function load(first: boolean) {
      if (first) setState((s) => ({ ...s, loading: true }));
      try {
        const result = await getRecommendation(lat, lng);
        if (!alive) return;
        setState({ ...toRankedLists(result), loading: false, usingMock: false });
      } catch {
        if (!alive) return;
        // 실패해도 화면을 비우지 않는다 해. 응급 서비스에서 빈 화면은 실패다 해.
        setState({ ...toRankedLists(mockRecommend()), loading: false, usingMock: true });
      }
    }

    load(true);
    const id = setInterval(() => load(false), REFRESH_MS);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, [lat, lng]);

  return state;
}
