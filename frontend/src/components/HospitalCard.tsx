import { BedBadge } from "./BedBadge";
import { bedStateOf, type HospitalView } from "../types/view";
import { kmLabel } from "../lib/format";

interface Props {
  hospital: HospitalView;
  rank: number;
  selected: boolean;
  /** 도착 시간순으로 볼 때만 "거리순 N위" 역전 표시를 띄운다 해 */
  showRankShift: boolean;
  onSelect: (id: number) => void;
}

export function HospitalCard({ hospital: h, rank, selected, showRankShift, onSelect }: Props) {
  const full = h.beds.general === 0;
  const moved = showRankShift && h.distanceRank !== rank;

  return (
    <button
      type="button"
      className={`card${rank === 1 ? " card--top" : ""}${full ? " card--dim" : ""}`}
      aria-current={selected}
      onClick={() => onSelect(h.id)}
    >
      <span className="card__rank mono">{rank}</span>

      <span className="card__body">
        <span className="card__name">{h.name}</span>
        <span className="card__meta">
          <span>{h.hospitalType}</span>
          <span className="dot" aria-hidden="true" />
          <span className="mono">{kmLabel(h.distanceKm)}</span>
        </span>
        <span className="card__beds">
          <BedBadge label="일반" count={h.beds.general} state={bedStateOf(h.beds.general)} />
          <BedBadge label="소아" count={h.beds.pediatric} />
          {h.beds.icu > 0 && <BedBadge label="중환자" count={h.beds.icu} />}
        </span>
      </span>

      <span className="card__eta">
        {h.etaMin === null ? (
          <span className="card__eta-none">–</span>
        ) : (
          <>
            <span className="card__eta-n mono">{h.etaMin}</span>
            <span className="card__eta-u">분</span>
          </>
        )}
        {moved && <span className="card__shift">거리순 {h.distanceRank}위</span>}
      </span>
    </button>
  );
}
