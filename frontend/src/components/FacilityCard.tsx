import type { FacilityView } from "../types/view";
import { kmLabel } from "../lib/format";

interface Props {
  facility: FacilityView;
  selected: boolean;
  onSelect: (id: number) => void;
}

const KIND_LABEL: Record<FacilityView["kind"], string> = {
  HOSPITAL: "병·의원",
  PHARMACY: "약국",
};

export function FacilityCard({ facility: f, selected, onSelect }: Props) {
  return (
    <button
      type="button"
      className={`card card--facility${f.closed ? " card--dim" : ""}`}
      aria-current={selected}
      onClick={() => onSelect(f.id)}
    >
      <span className={`kind kind--${f.kind.toLowerCase()}`}>{KIND_LABEL[f.kind]}</span>

      <span className="card__body">
        <span className="card__name">{f.name}</span>
        <span className="card__meta">
          <span>{f.address}</span>
          {f.distanceKm !== null && (
            <>
              <span className="dot" aria-hidden="true" />
              <span className="mono">{kmLabel(f.distanceKm)}</span>
            </>
          )}
        </span>
      </span>

      <span className="card__eta">
        {f.closed ? (
          <span className="closed">진료 종료</span>
        ) : f.closesAt ? (
          <>
            <span className="until mono">{f.closesAt}</span>
            <span className="card__eta-u">까지</span>
          </>
        ) : (
          <span className="card__eta-none">시간 미제공</span>
        )}
      </span>
    </button>
  );
}
