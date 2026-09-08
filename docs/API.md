# API 명세

전체 디자인 버전(다이어그램 포함)은 팀 아티팩트 페이지를 참고한다: 골든아워 개발 명세서.

## 1. 외부 API 신청 목록

| API | 제공 | 용도 | 승인 | 링크 |
|---|---|---|---|---|
| 전국 응급의료기관 정보 조회 (병원정보·실시간 가용병상·중증질환 수용가능정보) | 공공데이터포털 | 기능 ①③ 핵심 | 자동승인 | https://www.data.go.kr/data/15000563/openapi.do |
| 전국 병·의원 찾기 서비스 | 공공데이터포털 | 기능 ④ | 자동승인 | https://www.data.go.kr/data/15000736/openapi.do |
| 전국 약국 정보 조회 서비스 | 공공데이터포털 | 기능 ④ | 자동승인 | https://www.data.go.kr/data/15000576/openapi.do |
| 특일 정보 (공휴일 판정) | 한국천문연구원 | 기능 ④ | 자동승인 | https://www.data.go.kr/dataset/15012690/openapi.do |
| 길찾기 API (자동차 + 다중목적지) | 카카오모빌리티 | 기능 ② 핵심 | **수동승인 — 최우선 신청** | https://developers.kakaomobility.com/affiliate/navi-api/start |
| 지도 / 로컬 API | 카카오 | 지도 UI, 좌표 확인 | 즉시 발급 | https://developers.kakao.com/docs/latest/ko/local/common |
| 전국응급의료기관표준데이터 | 공공데이터포털 | 선택 — 초기 시드 데이터 | 자동승인 | https://www.data.go.kr/data/15096291/standard.do |

카카오모빌리티 길찾기 API만 사업자명 없이도 `devtalk.kakao.com`의 "카카오내비"
카테고리에 개인/학교 프로젝트용 사용 권한 요청 글을 올려서 승인받는 방식을 쓴다.
승인까지 시간이 걸릴 수 있으니 제일 먼저 신청한다.

외부 API 키는 절대 레포에 커밋하지 않는다 — `backend/.env` / 환경변수로만 주입한다
(`application.yml`의 `external.*` 항목 참고).

## 2. 내부 API (프론트 전달용)

| Method | Path | 설명 | 관련 기능 |
|---|---|---|---|
| GET | `/api/v1/hospitals/nearby` | 반경 내 병원 + 최신 병상현황 + 직선거리 | ① |
| POST | `/api/v1/hospitals/eta` | 후보 병원(최대 30곳) 다중목적지 ETA 일괄 산출 | ② |
| GET | `/api/v1/hospitals/recommend` | 병상+ETA 결합점수 추천순서, 직선거리 순위와 비교 | ③ |
| GET | `/api/v1/facilities/open-now` | 현재 진료중인 병·의원/약국 | ④ |
| GET | `/api/v1/hospitals/{id}` | 상세정보 · 전화 · 경로 딥링크 | ⑤ |
| GET | `/api/v1/system/external-status` | 외부 API 최종 성공 시각/상태 (장애 감지, 자동전환 판단용) | ⑥ |

`/api/v1/hospitals/nearby`는 `backend`에 뼈대가 구현되어 있다. 나머지는 각자
담당 기능에 맞춰 컨트롤러/서비스를 추가하면 된다.
