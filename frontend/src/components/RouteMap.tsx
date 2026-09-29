import { useEffect, useRef } from "react";
import { useKakaoLoader } from "../hooks/useKakaoLoader";

export interface RouteMarker {
  id: number | string;
  lat: number;
  lng: number;
  /** 시작점인지 (색을 다르게 찍는다 해) */
  origin?: boolean;
}

interface Props {
  center: { lat: number; lng: number };
  markers?: RouteMarker[];
  /** 경로 선을 그릴 좌표 배열 */
  path?: { lat: number; lng: number }[];
  level?: number;
  height?: number;
}

/**
 * 경로 안내 전용 지도다 해.
 *
 * 목록 화면의 MapView 와 달리 마커에 라벨을 붙이지 않고 경로 선을 그린다 해.
 * SDK 로더는 앱 공용 훅(useKakaoLoader)을 쓴다 — 스크립트가 두 번 붙지 않게 하기 위함이다 해.
 */
export function RouteMap({ center, markers = [], path, level = 5, height = 320 }: Props) {
  const boxRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const drawnRef = useRef<any[]>([]);
  const sdk = useKakaoLoader();

  useEffect(() => {
    if (sdk !== "ready" || !boxRef.current || mapRef.current) return;
    const { kakao } = window;
    mapRef.current = new kakao.maps.Map(boxRef.current, {
      center: new kakao.maps.LatLng(center.lat, center.lng),
      level,
    });
  }, [sdk, center.lat, center.lng, level]);

  // 마커와 경로 선
  useEffect(() => {
    if (sdk !== "ready" || !mapRef.current) return;
    const { kakao } = window;
    const map = mapRef.current;

    drawnRef.current.forEach((o) => o.setMap(null));
    drawnRef.current = [];

    markers.forEach((m) => {
      const el = document.createElement("div");
      el.className = `rpin${m.origin ? " rpin--origin" : ""}`;
      const overlay = new kakao.maps.CustomOverlay({
        position: new kakao.maps.LatLng(m.lat, m.lng),
        content: el,
        yAnchor: 0.5,
        zIndex: m.origin ? 2 : 3,
      });
      overlay.setMap(map);
      drawnRef.current.push(overlay);
    });

    if (path && path.length > 1) {
      const polyline = new kakao.maps.Polyline({
        path: path.map((p) => new kakao.maps.LatLng(p.lat, p.lng)),
        strokeWeight: 5,
        strokeColor: "#0E6E62",
        strokeOpacity: 0.85,
        strokeStyle: "solid",
      });
      polyline.setMap(map);
      drawnRef.current.push(polyline);
    }

    // 시작점과 도착점이 모두 보이도록 범위를 맞춘다 해
    if (markers.length > 1) {
      const bounds = new kakao.maps.LatLngBounds();
      markers.forEach((m) => bounds.extend(new kakao.maps.LatLng(m.lat, m.lng)));
      map.setBounds(bounds, 50, 50, 50, 50);
    }
  }, [sdk, markers, path]);

  return (
    <div className="routemap" style={{ height }}>
      <div ref={boxRef} className="routemap__canvas" />
      {sdk !== "ready" && (
        <div className="routemap__overlay">
          {sdk === "loading"
            ? "지도를 불러오는 중입니다"
            : sdk === "no-key"
              ? ".env 에 VITE_KAKAO_JS_KEY 를 넣으면 지도가 표시됩니다"
              : "지도를 불러오지 못했습니다. 키와 도메인 등록을 확인하세요"}
        </div>
      )}
    </div>
  );
}
