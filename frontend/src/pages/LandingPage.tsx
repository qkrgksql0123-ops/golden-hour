import { useNavigate } from "react-router-dom";
import { EmergencyNotice } from "../components/EmergencyNotice";
import { Logo } from "../components/Logo";

// 진입 화면. 응급 상황에서는 선택지가 많을수록 이탈하므로 버튼을 둘로만 둔다 해.
export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="landing">
      <header className="landing__top">
        <span className="brand">
          <Logo size={28} />
          골든아워
        </span>
        <EmergencyNotice />
      </header>

      <main className="landing__main">
        <div className="landing__hero">
          <p className="landing__eyebrow">실시간 응급의료기관 안내</p>
          <h1 className="landing__title">
            지금 갈 수 있는 응급실을
            <br />
            <em>도착 시간순</em>으로
          </h1>
          <p className="landing__lede">
            가까운 병원이 항상 빠른 것은 아닙니다. 골든아워는 실시간 가용 병상과
            실제 도로 소요시간을 함께 계산해 지금 실제로 갈 수 있는 곳을 순서대로 알려줍니다.
          </p>

          <div className="landing__actions">
            <button type="button" className="cta" onClick={() => navigate("/emergency")}>
              <span className="cta__t">지금 갈 수 있는 응급실</span>
              <span className="cta__d">실시간 병상 + 도착 시간순으로 안내</span>
            </button>
            <button type="button" className="cta cta--alt" disabled>
              <span className="cta__t">야간 진료 병원 · 약국</span>
              <span className="cta__d">준비 중입니다</span>
            </button>
          </div>
        </div>

        <ul className="landing__points">
          <li>
            <span className="landing__pn mono">01</span>
            <b>거리가 아니라 시간</b>
            <span>실시간 교통을 반영해 실제 도착 시간으로 순서를 정합니다.</span>
          </li>
          <li>
            <span className="landing__pn mono">02</span>
            <b>병상과 시간을 함께</b>
            <span>자리가 없는 병원은 가까워도 선택지가 되지 못합니다.</span>
          </li>
          <li>
            <span className="landing__pn mono">03</span>
            <b>멈추지 않는 안내</b>
            <span>실시간 정보를 받지 못해도 직전 정보와 대안을 보여줍니다.</span>
          </li>
        </ul>
      </main>

      <footer className="landing__foot">
        보호자가 직접 차량으로 이송하는 경우를 위한 서비스입니다. 의식이 없거나 호흡이
        어려운 경우에는 즉시 119에 신고하세요.
      </footer>
    </div>
  );
}
