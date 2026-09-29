import { useEffect, useRef } from "react";
import type { MapPoint } from "../types/view";
import type { Coords } from "../hooks/useGeolocation";

interface Props {
  center: Coords;
  points: MapPoint[];
  selectedId: number | null;
  onSelect: (id: number) => void;
}

/** 상태별 핀 색. tokens.css 변수를 그대로 읽어 다크 모드까지 따라간다 해. */
function pinColor(tone: string): string {
  const v = getComputedStyle(document.documentElement).getPropertyValue(`--${tone}`).trim();
  return v || "#1C6E3E";
}

function makePin(pt: MapPoint, selected: boolean, onClick: () => void): HTMLElement {
  const el = document.createElement("div");
  el.className = `kpin${selected ? " kpin--on" : ""}`;
  el.setAttribute("role", "button");
  el.setAttribute("tabindex", "0");
  el.setAttribute("aria-label", `${pt.name} ${pt.label}`);
  el.innerHTML = `
    <span class="kpin__label mono">${pt.label}</span>
    <span class="kpin__dot" style="background:${pinColor(pt.tone)}"></span>
    <span class="kpin__name">${pt.name}</span>
  `;
  el.addEventListener("click", onClick);
  el.addEventListener("keydown", (e) => {
    const k = (e as KeyboardEvent).key;
    if (k === "Enter" || k === " ") onClick();
  });
  return el;
}

export function KakaoMap({ center, points, selectedId, onSelect }: Props) {
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

  // 핀
  useEffect(() => {
    const { kakao } = window;
    const map = mapRef.current;
    if (!map) return;

    overlaysRef.current.forEach((o) => o.setMap(null));
    overlaysRef.current = points.map((pt) => {
      const el = makePin(pt, selectedId === pt.id, () => onSelect(pt.id));
      const overlay = new kakao.maps.CustomOverlay({
        position: new kakao.maps.LatLng(pt.lat, pt.lng),
        content: el,
        yAnchor: 1,
        zIndex: selectedId === pt.id ? 5 : 2,
      });
      overlay.setMap(map);
      return overlay;
    });

    // 첫 로드에서 내 위치와 기관이 모두 보이도록 범위를 맞춘다 해
    if (!fittedRef.current && points.length > 0) {
      const bounds = new kakao.maps.LatLngBounds();
      bounds.extend(new kakao.maps.LatLng(center.lat, center.lng));
      points.forEach((pt) => bounds.extend(new kakao.maps.LatLng(pt.lat, pt.lng)));
      map.setBounds(bounds, 60, 60, 60, 60);
      fittedRef.current = true;
    }
  }, [points, selectedId, onSelect, center.lat, center.lng]);

  // 선택한 지점으로 이동
  useEffect(() => {
    const { kakao } = window;
    const map = mapRef.current;
    if (!map || selectedId === null) return;
    const pt = points.find((x) => x.id === selectedId);
    if (pt) map.panTo(new kakao.maps.LatLng(pt.lat, pt.lng));
  }, [selectedId, points]);

  return <div className="kakaomap" ref={boxRef} />;
}
