import { useMemo, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Logo } from "../components/Logo";
import { LocationBar } from "../components/LocationBar";
import { LocationSearch } from "../components/LocationSearch";
import { EmergencyNotice } from "../components/EmergencyNotice";
import { SortToggle } from "../components/SortToggle";
import { HospitalList } from "../components/HospitalList";
import { DegradedBanner } from "../components/DegradedBanner";
import { DetailPanel } from "../components/DetailPanel";
import { MapView } from "../components/MapView";
import { useRecommendation } from "../hooks/useRecommendation";
import { useGeolocation, type Coords } from "../hooks/useGeolocation";
import { useKakaoLoader } from "../hooks/useKakaoLoader";
import { useAddress } from "../hooks/useAddress";
import type { SortMode } from "../types/view";
import { minutesSince, timeLabel } from "../lib/format";

// 기능 ①③ 화면. docs/API.md 의 /api/v1/hospitals/recommend 응답을 그대로 쓴다 해.
export default function HomePage() {
  const [sort, setSort] = useState<SortMode>("time");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [manualLabel, setManualLabel] = useState<string | null>(null);

  const sdk = useKakaoLoader();
  const geo = useGeolocation();
  const resolved = useAddress(geo.coords, sdk === "ready");
  const address = manualLabel ?? resolved;

  const { byTime, byDistance, degraded, oldestUpdatedAt, loading, usingMock } =
    useRecommendation(geo.coords.lat, geo.coords.lng);

  // ETA가 없으면 소요시간을 신뢰할 수 없으므로 거리순으로 고정한다 해.
  const effectiveSort: SortMode = degraded ? "distance" : sort;
  const items = useMemo(
    () => (effectiveSort === "time" ? byTime : byDistance),
    [effectiveSort, byTime, byDistance],
  );

  const selected = items.find((h) => h.id === selectedId) ?? null;

  const toggleSelect = useCallback((id: number) => {
    setSelectedId((cur) => (cur === id ? null : id));
  }, []);

  function pickPlace(coords: Coords, label: string) {
    geo.setManual(coords);
    setManualLabel(label);
    setSearchOpen(false);
  }

  return (
    <div className="app">
      <header className="apptop">
        <Link to="/" className="brand brand--link">
          <Logo size={24} />
          골든아워
        </Link>
        <LocationBar
          address={address}
          status={geo.status}
          onChange={() => setSearchOpen(true)}
          onRetry={() => {
            setManualLabel(null);
            geo.retry();
          }}
        />
        <EmergencyNotice />
      </header>

      {geo.message && (
        <p className="geonotice" role="status">
          {geo.message}
          <button type="button" className="geonotice__link" onClick={() => setSearchOpen(true)}>
            주소 직접 입력
          </button>
        </p>
      )}

      {usingMock && (
        <p className="mocknotice" role="status">
          백엔드에 연결하지 못해 목 데이터를 표시 중입니다 (개발용)
        </p>
      )}

      <div className="worksplit">
        <div className="side">
          <div className="sidehead">
            {degraded ? (
              <span className="sidehead__note">거리순 · 소요시간을 계산할 수 없습니다</span>
            ) : (
              <SortToggle value={sort} count={items.length} onChange={setSort} />
            )}
          </div>

          {degraded && oldestUpdatedAt && <DegradedBanner updatedAt={timeLabel(oldestUpdatedAt)} />}

          {loading && items.length === 0 && <p className="empty">주변 응급실을 찾고 있습니다…</p>}

          <HospitalList
            items={items}
            showRankShift={effectiveSort === "time" && !degraded}
            selectedId={selectedId}
            onSelect={toggleSelect}
          />

          {oldestUpdatedAt && (
            <div className="sidefoot">
              {degraded ? (
                <span className="stale">
                  ● 병상 정보 {timeLabel(oldestUpdatedAt)} 기준 · {minutesSince(oldestUpdatedAt)}분 경과
                </span>
              ) : (
                <>
                  <span className="live" aria-hidden="true" />
                  <span>병상 정보 {timeLabel(oldestUpdatedAt)} 기준 · 30초마다 갱신</span>
                </>
              )}
            </div>
          )}
        </div>

        <div className="mapwrap">
          <MapView
            center={geo.coords}
            items={items}
            selectedId={selectedId}
            sdk={sdk}
            onSelect={toggleSelect}
          />
          {selected && <DetailPanel hospital={selected} onClose={() => setSelectedId(null)} />}
        </div>
      </div>

      {searchOpen && (
        <LocationSearch ready={sdk === "ready"} onPick={pickPlace} onClose={() => setSearchOpen(false)} />
      )}
    </div>
  );
}
