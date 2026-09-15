import { bedStateOf, type HospitalView } from "../types/view";

interface Props {
  items: HospitalView[];
  selectedId: number | null;
  onSelect: (id: number) => void;
}

const ME = { x: 430, y: 355 };
// 좌표가 없는 개략도라서 목록 순서대로 자리를 배치한다 해.
const SLOTS = [
  { x: 560, y: 400 },
  { x: 250, y: 470 },
  { x: 700, y: 520 },
  { x: 330, y: 150 },
  { x: 520, y: 120 },
  { x: 150, y: 260 },
];

/**
 * 지도 키가 없을 때 쓰는 개략도다 해.
 * 카카오 키를 아직 못 받은 팀원도 앱 전체를 실행할 수 있어야 해서 남겨 둔다 해.
 */
export function SchematicMap({ items, selectedId, onSelect }: Props) {
  const placed = [...items].sort((a, b) => a.id - b.id);

  return (
    <svg className="mapbase" viewBox="0 0 820 620" role="img"
         aria-label="현재 위치와 주변 응급의료기관의 위치를 나타낸 개략도">
      <rect x="0" y="0" width="820" height="620" fill="var(--map)" />

      <g stroke="var(--mapline)" strokeWidth="14" strokeLinecap="round">
        <line x1="-20" y1="130" x2="840" y2="130" />
        <line x1="-20" y1="330" x2="840" y2="330" />
        <line x1="-20" y1="500" x2="840" y2="500" />
        <line x1="170" y1="-20" x2="170" y2="640" />
        <line x1="420" y1="-20" x2="420" y2="640" />
        <line x1="650" y1="-20" x2="650" y2="640" />
      </g>
      <g stroke="var(--mapline)" strokeWidth="6" opacity="0.7">
        <line x1="-20" y1="415" x2="840" y2="415" />
        <line x1="295" y1="330" x2="295" y2="640" />
        <line x1="540" y1="330" x2="540" y2="640" />
      </g>

      {/* 하천 — 다리가 두 곳뿐이라 가까운 병원이 더 오래 걸린다 해 */}
      <path d="M -20 262 C 180 222, 360 268, 560 232 S 780 186, 840 196"
            fill="none" stroke="var(--water)" strokeWidth="46" strokeLinecap="round" />
      <g stroke="var(--mapline)" strokeWidth="14" strokeLinecap="round">
        <line x1="170" y1="222" x2="170" y2="288" />
        <line x1="650" y1="188" x2="650" y2="252" />
      </g>

      <circle cx={ME.x} cy={ME.y} r="17" fill="var(--accent)" opacity="0.16" />
      <circle cx={ME.x} cy={ME.y} r="6.5" fill="var(--accent)" stroke="var(--panel)" strokeWidth="2.5" />
      <text x={ME.x} y={ME.y + 30} className="map-me" textAnchor="middle">내 위치</text>

      {placed.map((h, i) => {
        const slot = SLOTS[i % SLOTS.length];
        const on = selectedId === h.id;
        const state = bedStateOf(h.beds.general);
        const label = h.etaMin === null ? `${h.distanceKm.toFixed(1)}km` : `${h.etaMin}분`;
        const w = label.length * 7.6 + 18;
        return (
          <g key={h.id} className="pin" onClick={() => onSelect(h.id)} role="button"
             tabIndex={0} aria-label={`${h.name} ${label}`}>
            <rect x={slot.x - w / 2} y={slot.y - 42} width={w} height="23" rx="4"
                  fill={on ? "var(--accent)" : "var(--panel)"}
                  stroke={on ? "var(--accent)" : "var(--line)"} strokeWidth="1" />
            <text x={slot.x} y={slot.y - 26} textAnchor="middle"
                  className={on ? "pin__label pin__label--on" : "pin__label"}>{label}</text>
            <circle cx={slot.x} cy={slot.y} r={on ? 11 : 8} className={`pin__dot pin__dot--${state}`}
                    stroke="var(--panel)" strokeWidth="2.5" />
            <text x={slot.x} y={slot.y + 27} textAnchor="middle" className="pin__name">{h.name}</text>
          </g>
        );
      })}
    </svg>
  );
}
