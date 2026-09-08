import axios from "axios";

// .env(.local)에 VITE_API_BASE_URL=http://localhost:8080 형태로 설정한다 해.
// 값이 없으면 로컬 백엔드 기본 포트로 fallback 한다 해.
const baseURL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";

export const apiClient = axios.create({
  baseURL,
  timeout: 5000, // 응답 목표 P95 1.5초 기준으로 넉넉히 잡되, 장애 감지는 백엔드 서킷브레이커에 위임한다 해
  headers: {
    "Content-Type": "application/json",
  },
});
