import { Link } from "react-router-dom";
import { BedBadge } from "./BedBadge";
import { bedStateOf, type HospitalView } from "../types/view";
import { kmLabel, timeLabel } from "../lib/format";
import { predictBedsAtArrival } from "../lib/predict";

interface Props {
  hospital: HospitalView;
  onClose: () => void;
}

const CONFIDENCE_LABEL = { high: "높음", medium: "중간", low: "낮음", unknown: "-" } as const;

export function DetailPanel({ hospital: h, onClose }: Props) {
  const prediction = predictBedsAtArrival(h.bedHistory, h.beds.general, h.etaMin);

  return (
    <aside className="detail" aria-label={`${h.name} 상세 정보`}>
      <button type="button" className="detail__close" onClick={onClose} aria-label="닫기">
        ✕
      </button>

      <div className="detail__name">{h.name}</div>
      <div className="detail__sub">{h.hospitalType}</div>
      <div className="detail__sub">{h.address}</div>

      <div className="detail__big">
        {h.etaMin === null ? (
          <span className="detail__big-alt">계산 불가</span>
        ) : (
          <>
            <span className="detail__big-n mono">{h.etaMin}</span>
            <span className="detail__big-u">분 예상</span>
          </>
        )}
        <span className="detail__big-k mono">{kmLabel(h.distanceKm)}</span>
      </div>
      <div className="detail__note">
        {h.etaMin === null ? "직선거리 기준" : "현재 교통 기준 · 자가용 이동"}
      </div>

      <table className="bedtable">
        <thead>
          <tr>
            <th>병상 구분</th>
            <th style={{ textAlign: "right" }}>가용</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>응급실 일반</td><td><BedBadge label="" count={h.beds.general} /></td></tr>
          <tr><td>소아 전용</td><td><BedBadge label="" count={h.beds.pediatric} /></td></tr>
          <tr><td>중환자실</td><td><BedBadge label="" count={h.beds.icu} /></td></tr>
        </tbody>
      </table>

      {/* 데이터 한계를 숨기지 않는 것이 이 도메인의 신뢰다 해 */}
      <p className="detail__foot">{timeLabel(h.bedsUpdatedAt)} 기준 · 병원이 직접 입력한 값입니다</p>

      <div className="predict">
        <div className="predict__head">
          도착 시점 예상 병상{h.etaMin !== null && <span className="mono"> · {h.etaMin}분 후</span>}
        </div>
        {prediction.predictedGeneral === null ? (
          <p className="predict__alt">예상 소요시간을 알 수 없어 예측할 수 없습니다.</p>
        ) : (
          <>
            <div className="predict__row">
              <BedBadge label="일반" count={prediction.predictedGeneral} state={bedStateOf(prediction.predictedGeneral)} />
              {prediction.trendPerMin !== null && (
                <span className={`predict__trend${prediction.trendPerMin < 0 ? " predict__trend--down" : prediction.trendPerMin > 0 ? " predict__trend--up" : ""}`}>
                  {prediction.trendPerMin < 0 ? "▼" : prediction.trendPerMin > 0 ? "▲" : "―"} 최근 추세 반영
                </span>
              )}
              <span className="predict__conf">신뢰도 {CONFIDENCE_LABEL[prediction.confidence]}</span>
            </div>
            <p className="predict__note">
              현재 {h.beds.general}석 · 실시간 변동에 따라 실제 도착 시점 병상 수는 달라질 수 있습니다.
            </p>
          </>
        )}
      </div>

      <div className="detail__actions">
        <a className="btn btn--ghost" href={`tel:${h.phone}`}>전화 걸기</a>
        <Link className="btn" to={`/route/${h.id}`}>길 안내</Link>
      </div>
    </aside>
  );
}
