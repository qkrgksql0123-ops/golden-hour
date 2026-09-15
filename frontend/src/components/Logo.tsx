import { useId } from "react";

interface Props {
  /** 픽셀 크기 (정사각형) */
  size?: number;
}

/**
 * 골든아워 심볼.
 *
 * 바깥의 끊긴 고리는 흘러가는 시간을, 황금빛에서 청록으로 넘어가는 그라디언트는
 * 이름 그대로 '골든아워'를 나타낸다 해. 안쪽 바늘은 12시와 3시를 가리키면서
 * 동시에 의료 십자의 두 축이 된다 해.
 *
 * 안쪽 원과 바늘 색은 tokens.css 변수를 쓰므로 다크 모드에서도 그대로 따라온다 해.
 */
export function Logo({ size = 28 }: Props) {
  const gid = useId();

  return (
    <svg
      className="logo"
      width={size}
      height={size}
      viewBox="0 0 32 32"
      role="img"
      aria-label="골든아워"
    >
      <defs>
        <linearGradient id={`${gid}-ring`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#F2B84B" />
          <stop offset="45%" stopColor="#4FB79F" />
          <stop offset="100%" stopColor="var(--accent)" />
        </linearGradient>
      </defs>

      {/* 흘러가는 시간 — 12시 왼쪽에서 끊어진 고리 */}
      <circle
        cx="16" cy="16" r="14"
        fill="none"
        stroke={`url(#${gid}-ring)`}
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeDasharray="71 17"
        transform="rotate(-98 16 16)"
      />

      {/* 문자판 */}
      <circle cx="16" cy="16" r="10.2" fill="var(--accent)" />

      {/* 바늘 겸 십자 */}
      <g stroke="var(--accent-ink)" strokeWidth="2.4" strokeLinecap="round">
        <line x1="16" y1="16" x2="16" y2="10.4" />
        <line x1="16" y1="16" x2="20.2" y2="16" />
      </g>
      <circle cx="16" cy="16" r="1.35" fill="var(--accent-ink)" />
    </svg>
  );
}
