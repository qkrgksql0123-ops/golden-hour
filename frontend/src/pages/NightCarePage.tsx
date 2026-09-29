import { useMemo, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Logo } from "../components/Logo";
import { LocationBar } from "../components/LocationBar";
import { LocationSearch } from "../components/LocationSearch";
import { EmergencyNotice } from "../components/EmergencyNotice";
import { FacilityCard } from "../components/FacilityCard";
import { MapView } from "../components/MapView";
import { useOpenFacilities } from "../hooks/useOpenFacilities";
import { useGeolocation, type Coords } from "../hooks/useGeolocation";
import { useKakaoLoader } from "../hooks/useKakaoLoader";
import { useAddress } from "../hooks/useAddress";
import type { FacilityKind, MapPoint } from "../types/view";

type Filter = "ALL" | FacilityKind;

const TABS: { key: Filter; label: string }[] = [
  { key: "ALL", label: "전체" },
  { key: "HOSPITAL", label: "병·의원" },
  { key: "PHARMACY", label: "약국" },
];

// 기능 ④ 화면. docs/API.md 의 /api/v1/facilities/open-now 응답을 쓴다 해.
export default function NightCarePage() {
  const [filter, setFilter] = useState<Filter>("ALL");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [manualLabel, setManualLabel] = useState<string | null>(null);

  const sdk = useKakaoLoader();
  const geo = useGeolocation();
  const resolved = useAddress(geo.coords, sdk === "ready");
  const address = manualLabel ?? resolved;

  const { items, loading, usingMock } = useOpenFacilities(geo.coords.lat, geo.coords.lng);

  const shown = useMemo(() => {
    const list = filter === "ALL" ? items : items.filter((f) => f.kind === filter);
    // 문을 닫은 곳은 목록에서 지우지 않고 아래로 내린다 해. 닫혔다는 사실도 정보다 해.
    return [...list].sort((a, b) => {
      if (a.closed !== b.closed) return a.closed ? 1 : -1;
      return (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity);
    });
  }, [items, filter]);

  const points: MapPoint[] = useMemo(
    () =>
      shown.map((f) => ({
        id: f.id,
        name: f.name,
        lat: f.lat,
        lng: f.lng,
        tone: f.closed ? "full" : "ok",
        label: f.closed ? "종료" : (f.closesAt ?? "—"),
      })),
    [shown],
  );

  const selected = shown.find((f) => f.id === selectedId) ?? null;

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
            <div className="sortrow">
              <div className="seg" role="group" aria-label="기관 종류">
                {TABS.map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    aria-pressed={filter === t.key}
                    onClick={() => setFilter(t.key)}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
              <span className="count mono">{shown.length}곳</span>
            </div>
          </div>

          {loading && shown.length === 0 && <p className="empty">문 연 곳을 찾고 있습니다…</p>}
          {!loading && shown.length === 0 && (
            <p className="empty">지금 문을 연 곳이 없습니다. 응급실 안내를 이용해 주세요.</p>
          )}

          {shown.length > 0 && (
            <div className="sidelist">
              {shown.map((f) => (
                <FacilityCard
                  key={f.id}
                  facility={f}
                  selected={selectedId === f.id}
                  onSelect={toggleSelect}
                />
              ))}
            </div>
          )}

          <div className="sidefoot">
            <span className="live" aria-hidden="true" />
            <span>요일 · 공휴일 · 점심시간을 반영한 현재 기준입니다</span>
          </div>
        </div>

        <div className="mapwrap">
          <MapView
            center={geo.coords}
            points={points}
            selectedId={selectedId}
            sdk={sdk}
            legend={[
              { cls: "lg--ok", label: "진료 중" },
              { cls: "lg--full", label: "진료 종료" },
            ]}
            onSelect={toggleSelect}
          />

          {selected && (
            <aside className="detail" aria-label={`${selected.name} 상세 정보`}>
              <button type="button" className="detail__close" onClick={() => setSelectedId(null)} aria-label="닫기">
                ✕
              </button>
              <div className="detail__name">{selected.name}</div>
              <div className="detail__sub">
                {selected.kind === "HOSPITAL" ? "병·의원" : "약국"}
              </div>
              <div className="detail__sub">{selected.address}</div>

              <div className="detail__big">
                {selected.closed ? (
                  <span className="detail__big-alt">진료 종료</span>
                ) : selected.closesAt ? (
                  <>
                    <span className="detail__big-n mono">{selected.closesAt}</span>
                    <span className="detail__big-u">까지</span>
                  </>
                ) : (
                  <span className="detail__big-alt">시간 미제공</span>
                )}
                {selected.distanceKm !== null && (
                  <span className="detail__big-k mono">{selected.distanceKm.toFixed(1)}km</span>
                )}
              </div>

              <p className="detail__foot">방문 전 전화로 진료 여부를 확인하세요</p>

              <div className="detail__actions">
                <a className="btn btn--ghost" href={`tel:${selected.phone}`}>전화 걸기</a>
                <a
                  className="btn"
                  href={`https://map.kakao.com/link/to/${encodeURIComponent(selected.name)},${selected.lat},${selected.lng}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  길 안내
                </a>
              </div>
            </aside>
          )}
        </div>
      </div>

      {searchOpen && (
        <LocationSearch ready={sdk === "ready"} onPick={pickPlace} onClose={() => setSearchOpen(false)} />
      )}
    </div>
  );
}
