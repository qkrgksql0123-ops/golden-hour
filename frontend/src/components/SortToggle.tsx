import type { SortMode } from "../types/view";

interface Props {
  value: SortMode;
  count: number;
  onChange: (v: SortMode) => void;
}

export function SortToggle({ value, count, onChange }: Props) {
  return (
    <div className="sortrow">
      <div className="seg" role="group" aria-label="정렬 기준">
        <button type="button" aria-pressed={value === "time"} onClick={() => onChange("time")}>
          도착 시간순
        </button>
        <button type="button" aria-pressed={value === "distance"} onClick={() => onChange("distance")}>
          거리순
        </button>
      </div>
      <span className="count mono">{count}곳</span>
    </div>
  );
}
