import { HospitalCard } from "./HospitalCard";
import type { HospitalView } from "../types/view";

interface Props {
  items: HospitalView[];
  showRankShift: boolean;
  selectedId: number | null;
  onSelect: (id: number) => void;
}

export function HospitalList({ items, showRankShift, selectedId, onSelect }: Props) {
  if (items.length === 0) {
    return <p className="empty">주변에 표시할 응급의료기관이 없습니다. 위치를 다시 확인해 주세요.</p>;
  }

  return (
    <div className="sidelist">
      {items.map((h, i) => (
        <HospitalCard
          key={h.id}
          hospital={h}
          rank={i + 1}
          selected={selectedId === h.id}
          showRankShift={showRankShift}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}
