interface Props {
  active: boolean;
  onChange: (v: boolean) => void;
}

/** 소아 병상이 있는 병원만 걸러 보는 모드 토글이다 해. */
export function PediatricToggle({ active, onChange }: Props) {
  return (
    <button
      type="button"
      className={`pedtoggle${active ? " pedtoggle--on" : ""}`}
      aria-pressed={active}
      onClick={() => onChange(!active)}
    >
      소아전용
    </button>
  );
}
