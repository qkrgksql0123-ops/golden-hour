import { useCallback, useEffect, useState } from "react";

/** 위치를 못 받았을 때 쓰는 기본 좌표 (강남역)다 해. 화면에는 기본 위치임을 표시한다 해. */
export const DEFAULT_COORDS = { lat: 37.4979, lng: 127.0276 };

export interface Coords {
  lat: number;
  lng: number;
}

export type GeoStatus = "locating" | "granted" | "denied" | "unsupported" | "error" | "manual";

export interface GeoState {
  coords: Coords;
  status: GeoStatus;
  message: string | null;
  retry: () => void;
  setManual: (coords: Coords) => void;
}

const OPTIONS: PositionOptions = { enableHighAccuracy: true, timeout: 8000, maximumAge: 60_000 };

/**
 * 현재 위치 확보.
 *
 * 권한 거부·시간 초과·미지원 어느 경우에도 좌표는 항상 반환한다 해.
 * 응급 서비스에서 "권한 없음 = 사용 불가"가 되면 안 되기 때문이다 해.
 */
export function useGeolocation(): GeoState {
  const [coords, setCoords] = useState<Coords>(DEFAULT_COORDS);
  const [status, setStatus] = useState<GeoStatus>("locating");
  const [message, setMessage] = useState<string | null>(null);

  const locate = useCallback(() => {
    if (!("geolocation" in navigator)) {
      setStatus("unsupported");
      setMessage("이 브라우저는 위치 기능을 지원하지 않습니다. 주소를 직접 입력해 주세요.");
      return;
    }

    setStatus("locating");
    setMessage(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setStatus("granted");
        setMessage(null);
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setStatus("denied");
          setMessage("위치 권한이 꺼져 있습니다. 주소를 직접 입력하거나 브라우저 설정에서 허용해 주세요.");
        } else {
          setStatus("error");
          setMessage("위치를 확인하지 못했습니다. 기본 위치로 표시합니다.");
        }
      },
      OPTIONS,
    );
  }, []);

  useEffect(() => {
    locate();
  }, [locate]);

  const setManual = useCallback((c: Coords) => {
    setCoords(c);
    setStatus("manual");
    setMessage(null);
  }, []);

  return { coords, status, message, retry: locate, setManual };
}
