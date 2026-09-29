import { KakaoMap } from "./KakaoMap";
import { SchematicMap } from "./SchematicMap";
import type { MapPoint } from "../types/view";
import type { Coords } from "../hooks/useGeolocation";
import type { SdkStatus } from "../hooks/useKakaoLoader";

export interface LegendItem {
  /** lg--ok / lg--tight / lg--full / lg--accent */
  cls: string;
  label: string;
}

interface Props {
  center: Coords;
  points: MapPoint[];
  selectedId: number | null;
  sdk: SdkStatus;
  legend: LegendItem[];
  onSelect: (id: number) => void;
}

/** SDK가 준비되면 실제 카카오 지도를, 아니면 개략도를 보여준다 해. */
export function MapView({ center, points, selectedId, sdk, legend, onSelect }: Props) {
  return (
    <div className="maparea">
      {sdk === "ready" ? (
        <KakaoMap center={center} points={points} selectedId={selectedId} onSelect={onSelect} />
      ) : (
        <SchematicMap points={points} selectedId={selectedId} onSelect={onSelect} />
      )}

      {sdk !== "ready" && (
        <div className="mapnotice">
          {sdk === "loading"
            ? "지도를 불러오는 중입니다"
            : sdk === "no-key"
              ? ".env 에 VITE_KAKAO_JS_KEY 를 넣으면 실제 지도로 바뀝니다 (지금은 개략도)"
              : "지도를 불러오지 못했습니다. 키와 도메인 등록을 확인하세요 (지금은 개략도)"}
        </div>
      )}

      <div className="maplegend">
        <span><i className="lg lg--accent" />내 위치</span>
        {legend.map((it) => (
          <span key={it.label}><i className={`lg ${it.cls}`} />{it.label}</span>
        ))}
      </div>
    </div>
  );
}
