import { BedBadge } from "./BedBadge";
import type { HospitalView } from "../types/view";
import { kmLabel, timeLabel } from "../lib/format";

interface Props {
  hospital: HospitalView;
  onClose: () => void;
}

export function DetailPanel({ hospital: h, onClose }: Props) {
  const mapLink = `https://map.kakao.com/link/to/${encodeURIComponent(h.name)},${h.lat},${h.lng}`;

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

      <div className="detail__actions">
        <a className="btn btn--ghost" href={`tel:${h.phone}`}>전화 걸기</a>
        <a className="btn" href={mapLink} target="_blank" rel="noreferrer">길 안내</a>
      </div>
    </aside>
  );
}
