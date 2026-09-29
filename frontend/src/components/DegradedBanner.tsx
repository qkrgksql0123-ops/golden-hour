interface Props {
  updatedAt: string;
}

/**
 * ETA를 못 받은 상황 안내.
 * 응급 서비스에서 "정보 없음" 화면은 실패이므로
 * 무엇이 실패했는지 + 기준 시각 + 대안 행동을 함께 알린다 해.
 */
export function DegradedBanner({ updatedAt }: Props) {
  return (
    <div className="degraded" role="status">
      <b>도착 시간을 계산하지 못했습니다</b>
      병상 현황은 {updatedAt} 기준이며 지금은 직선거리순으로 표시합니다. 방문 전 전화로 확인하세요.
    </div>
  );
}
