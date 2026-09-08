import { useEffect, useState } from "react";
import { getNearbyHospitals } from "../api/hospitals";
import type { Hospital } from "../types/hospital";

// 기능 ① 실시간 응급실 조회 화면의 시작점이다 해.
// 지도(Kakao Map SDK)는 API 키 발급 후 붙이고, 지금은 목록 뼈대만 잡아둔다 해.
export default function HomePage() {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "done">(
    "idle"
  );

  useEffect(() => {
    if (!navigator.geolocation) return;
    setStatus("loading");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const result = await getNearbyHospitals(
            pos.coords.latitude,
            pos.coords.longitude
          );
          setHospitals(result);
          setStatus("done");
        } catch (err) {
          console.error("병원 조회 실패", err);
          setStatus("error");
        }
      },
      () => setStatus("error")
    );
  }, []);

  return (
    <main style={{ maxWidth: 480, margin: "0 auto", padding: "24px 16px" }}>
      <h1>골든아워</h1>
      <p>지금 위치에서 가장 빨리 도착 가능한 응급실을 찾는다 해.</p>

      {status === "loading" && <p>주변 응급실을 찾는 중...</p>}
      {status === "error" && (
        <p>위치 정보를 가져오지 못했다 해. 위치 권한을 확인해달라 해.</p>
      )}

      <ul style={{ listStyle: "none", padding: 0 }}>
        {hospitals.map((h) => (
          <li
            key={h.id}
            style={{
              border: "1px solid #ddd",
              borderRadius: 8,
              padding: 12,
              marginBottom: 8,
            }}
          >
            <strong>{h.name}</strong>
            <div>일반 {h.latestGeneralBeds} · 소아 {h.latestPediatricBeds} · 중환자 {h.latestIcuBeds}</div>
            <div>직선거리 {h.straightDistanceM ? (h.straightDistanceM / 1000).toFixed(1) : "-"}km</div>
          </li>
        ))}
      </ul>
    </main>
  );
}
