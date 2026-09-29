import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Logo } from "../components/Logo";
import { EmergencyNotice } from "../components/EmergencyNotice";
import { RouteMap } from "../components/RouteMap";
import { BedBadge } from "../components/BedBadge";
import { getEta, getHospitalDetail } from "../api/hospitals";
import { mockRecommend } from "../mocks/recommend";
import { useGeolocation } from "../hooks/useGeolocation";
import type { Hospital } from "../types/hospital";
import { bedStateOf } from "../types/view";
import { etaMinutes } from "../lib/ranking";
import { predictBedsAtArrival } from "../lib/predict";

const CONFIDENCE_LABEL = { high: "높음", medium: "중간", low: "낮음", unknown: "-" } as const;

/**
 * 기능 ⑤ 경로 안내 화면.
 *
 * TODO(백엔드): 지금은 출발지–병원 직선을 그린다 해.
 * /api/v1/hospitals/eta 응답에 실제 경로 좌표(polyline)가 추가되면 path 를 그걸로 교체한다 해.
 */
export default function RoutePage() {
  const { id } = useParams<{ id: string }>();
  const geo = useGeolocation();

  const [hospital, setHospital] = useState<Hospital | null>(null);
  const [etaMin, setEtaMin] = useState<number | null>(null);
  const [usingMock, setUsingMock] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const hospitalId = Number(id);
    let alive = true;

    async function load() {
      try {
        const [detail, eta] = await Promise.all([
          getHospitalDetail(hospitalId),
          getEta({ lat: geo.coords.lat, lng: geo.coords.lng }, [hospitalId]),
        ]);
        if (!alive) return;
        setHospital(detail);
        setEtaMin(eta[0]?.etaSeconds != null ? etaMinutes(eta[0].etaSeconds) : null);
        setUsingMock(false);
      } catch {
        if (!alive) return;
        // 백엔드가 아직 없으면 목 데이터에서 찾는다 해
        const mock = mockRecommend();
        const found = mock.combinedRanking.find((h) => h.id === hospitalId);
        setHospital(found ?? null);
        setEtaMin(found ? etaMinutes(found.etaSeconds) : null);
        setUsingMock(true);
      } finally {
        if (alive) setLoading(false);
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, [id, geo.coords.lat, geo.coords.lng]);

  return (
    <div className="app">
      <header className="apptop">
        <Link to="/" className="brand brand--link">
          <Logo size={24} />
          골든아워
        </Link>
        <EmergencyNotice />
      </header>

      {usingMock && (
        <p className="mocknotice" role="status">
          백엔드에 연결하지 못해 목 데이터를 표시 중입니다 (개발용)
        </p>
      )}

      <main className="route">
        <Link to="/emergency" className="route__back">← 목록으로</Link>

        {loading && <p className="empty">경로를 계산하고 있습니다…</p>}

        {!loading && !hospital && (
          <p className="empty empty--warn">
            병원 정보를 불러오지 못했습니다. 목록에서 다시 선택해 주세요.
          </p>
        )}

        {hospital && (
          <>
            <h1 className="route__title">{hospital.name}</h1>
            <p className="route__sub">{hospital.hospitalType} · {hospital.address}</p>

            <div className="route__stat">
              {etaMin === null ? (
                <span className="route__stat-alt">소요시간 계산 불가</span>
              ) : (
                <>
                  <span className="route__stat-n mono">{etaMin}</span>
                  <span className="route__stat-u">분 예상</span>
                </>
              )}
              <span className="route__stat-note">현재 교통 기준 · 자가용 이동</span>
            </div>

            {(() => {
              const prediction = predictBedsAtArrival(hospital.bedHistory, hospital.latestGeneralBeds, etaMin);
              return (
                <div className="predict">
                  <div className="predict__head">
                    도착 시점 예상 병상{etaMin !== null && <span className="mono"> · {etaMin}분 후</span>}
                  </div>
                  {prediction.predictedGeneral === null ? (
                    <p className="predict__alt">예상 소요시간을 알 수 없어 예측할 수 없습니다.</p>
                  ) : (
                    <>
                      <div className="predict__row">
                        <BedBadge
                          label="일반"
                          count={prediction.predictedGeneral}
                          state={bedStateOf(prediction.predictedGeneral)}
                        />
                        {prediction.trendPerMin !== null && (
                          <span
                            className={`predict__trend${
                              prediction.trendPerMin < 0
                                ? " predict__trend--down"
                                : prediction.trendPerMin > 0
                                  ? " predict__trend--up"
                                  : ""
                            }`}
                          >
                            {prediction.trendPerMin < 0 ? "▼" : prediction.trendPerMin > 0 ? "▲" : "―"} 최근 추세 반영
                          </span>
                        )}
                        <span className="predict__conf">신뢰도 {CONFIDENCE_LABEL[prediction.confidence]}</span>
                      </div>
                      <p className="predict__note">
                        현재 {hospital.latestGeneralBeds}석 · 실시간 변동에 따라 실제 도착 시점 병상 수는 달라질 수 있습니다.
                      </p>
                    </>
                  )}
                </div>
              );
            })()}

            <RouteMap
              center={geo.coords}
              markers={[
                { id: "origin", lat: geo.coords.lat, lng: geo.coords.lng, origin: true },
                { id: hospital.id, lat: hospital.lat, lng: hospital.lng },
              ]}
              path={[geo.coords, { lat: hospital.lat, lng: hospital.lng }]}
              height={340}
            />
            <p className="route__caption">
              지도의 선은 직선 경로입니다. 실제 주행 경로는 내비게이션에서 확인하세요.
            </p>

            <div className="route__actions">
              <a className="btn btn--ghost" href={`tel:${hospital.phone}`}>전화 걸기</a>
              <a
                className="btn"
                href={`https://map.kakao.com/link/to/${encodeURIComponent(hospital.name)},${hospital.lat},${hospital.lng}`}
                target="_blank"
                rel="noreferrer"
              >
                내비게이션 앱으로 열기
              </a>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
