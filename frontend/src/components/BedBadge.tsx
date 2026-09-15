import { bedStateOf, type BedState } from "../types/view";

interface Props {
  label: string;
  count: number;
  state?: BedState;
}

export function BedBadge({ label, count, state }: Props) {
  const s = state ?? bedStateOf(count);
  return (
    <span className={`badge badge--${s}`}>
      {label ? `${label} ` : ""}
      {count}
    </span>
  );
}
