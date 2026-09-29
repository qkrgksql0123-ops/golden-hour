import { useEffect, useState } from "react";

const KEY = import.meta.env.VITE_KAKAO_JS_KEY ?? "";
const SRC = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KEY}&libraries=services&autoload=false`;
const SCRIPT_ID = "kakao-maps-sdk";

export type SdkStatus = "no-key" | "loading" | "ready" | "error";

/**
 * 카카오 지도 SDK를 동적으로 불러온다 해.
 *
 * 키가 없으면 "no-key" 를 돌려주고 아무것도 하지 않는다 해.
 * 키를 아직 못 받은 팀원도 앱 전체를 실행할 수 있어야 하기 때문이다 해 (지도는 개략도로 대체된다 해).
 */
export function useKakaoLoader(): SdkStatus {
  const [status, setStatus] = useState<SdkStatus>(KEY ? "loading" : "no-key");

  useEffect(() => {
    if (!KEY) return;
    if (window.kakao?.maps?.Map) {
      setStatus("ready");
      return;
    }

    let script = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    const onLoad = () => window.kakao.maps.load(() => setStatus("ready"));
    const onError = () => setStatus("error");

    if (!script) {
      script = document.createElement("script");
      script.id = SCRIPT_ID;
      script.src = SRC;
      script.async = true;
      document.head.appendChild(script);
    }
    script.addEventListener("load", onLoad);
    script.addEventListener("error", onError);
    return () => {
      script?.removeEventListener("load", onLoad);
      script?.removeEventListener("error", onError);
    };
  }, []);

  return status;
}
