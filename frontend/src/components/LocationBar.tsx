import type { GeoStatus } from "../hooks/useGeolocation";

interface Props {
  address: string;
  status: GeoStatus;
  onChange: () => void;
  onRetry: () => void;
}

const HINT: Partial<Record<GeoStatus, string>> = {
  locating: "확인 중",
  denied: "기본 위치",
  error: "기본 위치",
  unsupported: "기본 위치",
  manual: "직접 지정",
};

export function LocationBar({ address, status, onChange, onRetry }: Props) {
  const hint = HINT[status];
  const off = status === "denied" || status === "error" || status === "unsupported";

  return (
    <div className={`locfield${off ? " locfield--off" : ""}`}>
      <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
        <path d="M8 0a5 5 0 0 0-5 5c0 3.5 5 11 5 11s5-7.5 5-11a5 5 0 0 0-5-5zm0 7a2 2 0 1 1 0-4 2 2 0 0 1 0 4z" />
      </svg>
      <span className="locfield__addr">{address}</span>
      {hint && <span className="locfield__hint">{hint}</span>}
      {off && (
        <button type="button" className="locfield__link" onClick={onRetry}>
          다시 시도
        </button>
      )}
      <button type="button" className="locfield__link" onClick={onChange}>
        변경
      </button>
    </div>
  );
}
