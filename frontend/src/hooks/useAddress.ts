import { useEffect, useState } from "react";
import type { Coords } from "./useGeolocation";

/** 좌표를 행정동 주소로 바꾼다 해 (카카오 로컬). SDK가 없으면 좌표를 그대로 보여준다 해. */
export function useAddress(coords: Coords, sdkReady: boolean): string {
  const [address, setAddress] = useState("위치 확인 중");

  useEffect(() => {
    if (!sdkReady || !window.kakao?.maps?.services) {
      setAddress(`${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`);
      return;
    }

    let alive = true;
    const geocoder = new window.kakao.maps.services.Geocoder();
    geocoder.coord2RegionCode(coords.lng, coords.lat, (result: any[], status: string) => {
      if (!alive) return;
      if (status === window.kakao.maps.services.Status.OK && result.length > 0) {
        const region = result.find((r) => r.region_type === "H") ?? result[0];
        setAddress(region.address_name);
      } else {
        setAddress(`${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`);
      }
    });

    return () => {
      alive = false;
    };
  }, [coords.lat, coords.lng, sdkReady]);

  return address;
}
