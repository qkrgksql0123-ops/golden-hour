import { KakaoMap } from "./KakaoMap";
import { SchematicMap } from "./SchematicMap";
import type { HospitalView } from "../types/view";
import type { Coords } from "../hooks/useGeolocation";
import type { SdkStatus } from "../hooks/useKakaoLoader";

interface Props {
  center: Coords;
  items: HospitalView[];
  selectedId: number | null;
  sdk: SdkStatus;
  onSelect: (id: number) => void;
}

/** SDK가 준비되면 실제 카카오 지도를, 아니면 개략도를 보여준다 해. */
export function MapView({ center, items, selectedId, sdk, onSelect }: Props) {
  return (
    <div className="maparea">
      {sdk === "ready" ? (
        <KakaoMap center={center} items={items} selectedId={selectedId} onSelect={onSelect} />
      ) : (
        <SchematicMap items={items} selectedId={selectedId} onSelect={onSelect} />
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
        <span><i className="lg lg--ok" />병상 여유</span>
        <span><i className="lg lg--tight" />병상 부족</span>
        <span><i className="lg lg--full" />수용 불가</span>
      </div>
    </div>
  );
}
