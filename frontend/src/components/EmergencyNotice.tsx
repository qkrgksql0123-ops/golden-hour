/** 모든 화면 상단에 고정. 서비스 범위(자가용 이송)를 사용자에게 알리는 장치다 해. */
export function EmergencyNotice() {
  return (
    <div className="emergchip">
      <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
        <path d="M6 1h4v5h5v4h-5v5H6v-5H1V6h5z" />
      </svg>
      <span>
        <b>의식·호흡 이상이면 즉시 119</b> · 이 서비스는 자가용 이송용입니다
      </span>
    </div>
  );
}
