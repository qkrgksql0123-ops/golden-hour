import { useEffect, useState } from "react";
import { getOpenFacilitiesNow } from "../api/hospitals";
import { mockFacilities } from "../mocks/facilities";
import type { FacilityView } from "../types/view";

const REFRESH_MS = 60_000; // 진료 종료 시각은 초 단위로 변하지 않으니 1분이면 충분하다 해

interface State {
  items: FacilityView[];
  loading: boolean;
  usingMock: boolean;
}

/**
 * 지금 문을 연 병·의원과 약국을 불러온다 해.
 *
 * 백엔드가 아직 없거나 죽어 있으면 목 데이터로 넘어간다 해.
 * 응답에 closesAt/distanceM 이 없으면 화면에서 "시간 미제공"으로 표시한다 해.
 */
export function useOpenFacilities(lat: number, lng: number): State {
  const [state, setState] = useState<State>({ items: [], loading: true, usingMock: false });

  useEffect(() => {
    let alive = true;

    async function load(first: boolean) {
      if (first) setState((s) => ({ ...s, loading: true }));
      try {
        const data = await getOpenFacilitiesNow(lat, lng);
        if (!alive) return;
        const items: FacilityView[] = data.map((f) => {
          const extra = f as typeof f & { closesAt?: string; distanceM?: number };
          return {
            id: f.id,
            name: f.name,
            kind: f.type,
            address: f.address,
            phone: f.phone,
            lat: f.lat,
            lng: f.lng,
            distanceKm: extra.distanceM != null ? extra.distanceM / 1000 : null,
            closesAt: extra.closesAt ?? null,
            closed: false,
          };
        });
        setState({ items, loading: false, usingMock: false });
      } catch {
        if (!alive) return;
        setState({ items: mockFacilities(), loading: false, usingMock: true });
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
