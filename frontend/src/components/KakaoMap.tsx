import { useEffect, useRef } from "react";
import { bedStateOf, type HospitalView } from "../types/view";
import type { Coords } from "../hooks/useGeolocation";

interface Props {
  center: Coords;
  items: HospitalView[];
  selectedId: number | null;
  onSelect: (id: number) => void;
}

/** 병상 상태별 핀 색. tokens.css 변수를 그대로 읽어 다크 모드까지 따라간다 해. */
function pinColor(state: string): string {
  const v = getComputedStyle(document.documentElement).getPropertyValue(`--${state}`).trim();
  return v || "#1C6E3E";
}

function makePin(h: HospitalView, selected: boolean, onClick: () => void): HTMLElement {
  const label = h.etaMin === null ? `${h.distanceKm.toFixed(1)}km` : `${h.etaMin}분`;

  const el = document.createElement("div");
  el.className = `kpin${selected ? " kpin--on" : ""}`;
  el.setAttribute("role", "button");
  el.setAttribute("tabindex", "0");
  el.setAttribute("aria-label", `${h.name} ${label}`);
  el.innerHTML = `
    <span class="kpin__label mono">${label}</span>
    <span class="kpin__dot" style="background:${pinColor(bedStateOf(h.beds.general))}"></span>
    <span class="kpin__name">${h.name}</span>
  `;
  el.addEventListener("click", onClick);
  el.addEventListener("keydown", (e) => {
    const k = (e as KeyboardEvent).key;
    if (k === "Enter" || k === " ") onClick();
  });
  return el;
}

export function KakaoMap({ center, items, selectedId, onSelect }: Props) {
  const boxRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const overlaysRef = useRef<any[]>([]);
  const meRef = useRef<any>(null);
  const fittedRef = useRef(false);

  useEffect(() => {
    if (!boxRef.current || mapRef.current) return;
    const { kakao } = window;
    mapRef.current = new kakao.maps.Map(boxRef.current, {
      center: new kakao.maps.LatLng(center.lat, center.lng),
      level: 6,
    });
  }, [center.lat, center.lng]);

  // 내 위치 마커
  useEffect(() => {
    const { kakao } = window;
    if (!mapRef.current) return;
    const pos = new kakao.maps.LatLng(center.lat, center.lng);

    if (meRef.current) {
      meRef.current.setPosition(pos);
    } else {
      const el = document.createElement("div");
      el.className = "kme";
      el.innerHTML = `<span class="kme__dot"></span><span class="kme__label">내 위치</span>`;
      meRef.current = new kakao.maps.CustomOverlay({ position: pos, content: el, yAnchor: 0.5, zIndex: 1 });
      meRef.current.setMap(mapRef.current);
    }
    if (!fittedRef.current) mapRef.current.setCenter(pos);
  }, [center.lat, center.lng]);

  // 병원 핀
  useEffect(() => {
    const { kakao } = window;
    const map = mapRef.current;
    if (!map) return;

    overlaysRef.current.forEach((o) => o.setMap(null));
    overlaysRef.current = items.map((h) => {
      const el = makePin(h, selectedId === h.id, () => onSelect(h.id));
      const overlay = new kakao.maps.CustomOverlay({
        position: new kakao.maps.LatLng(h.lat, h.lng),
        content: el,
        yAnchor: 1,
        zIndex: selectedId === h.id ? 5 : 2,
      });
      overlay.setMap(map);
      return overlay;
    });

    // 첫 로드에서 내 위치와 병원이 모두 보이도록 범위를 맞춘다 해
    if (!fittedRef.current && items.length > 0) {
      const bounds = new kakao.maps.LatLngBounds();
      bounds.extend(new kakao.maps.LatLng(center.lat, center.lng));
      items.forEach((h) => bounds.extend(new kakao.maps.LatLng(h.lat, h.lng)));
      map.setBounds(bounds, 60, 60, 60, 60);
      fittedRef.current = true;
    }
  }, [items, selectedId, onSelect, center.lat, center.lng]);

  // 선택한 병원으로 이동
  useEffect(() => {
    const { kakao } = window;
    const map = mapRef.current;
    if (!map || selectedId === null) return;
    const h = items.find((x) => x.id === selectedId);
    if (h) map.panTo(new kakao.maps.LatLng(h.lat, h.lng));
  }, [selectedId, items]);

  return <div className="kakaomap" ref={boxRef} />;
}
