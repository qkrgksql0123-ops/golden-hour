# golden-hour

응급 상황에서 보호자가 실제로 가장 빨리 도달할 수 있는 응급의료기관을, 실시간
가용 병상과 실시간 교통을 결합해 시간순으로 추천하는 웹 서비스.

- 팀: 코드블루 (Code Blue)
- 프로젝트명: 골든아워

## 구조 (모노레포)

```
golden-hour/
├── backend/     Spring Boot 4.1 (Java 17) + PostgreSQL
├── frontend/    React + TypeScript (Vite)
├── docs/        ERD, API 명세
└── docker-compose.yml   로컬 PostgreSQL
```

## 시작하기

### 1. DB 띄우기

```bash
docker compose up -d
```

### 2. 백엔드

```bash
cd backend
cp .env.example .env   # 값 채우고
./gradlew bootRun
```

기본 포트: `8080`. `GET /api/v1/hospitals/nearby?lat=&lng=&radiusKm=`부터 동작한다.

> Spring Boot 3는 2026-06-30부로 오픈소스 지원이 종료돼서, 현재 지원되는
> 4.1 기준으로 스캐폴딩했다. 강의 자료가 3.x 문법 기준이면 대부분 그대로
> 통하지만(패키지 구조 동일), 다르면 `backend/build.gradle`의 플러그인
> 버전만 3.5.16으로 내리면 된다.

### 3. 프론트엔드

```bash
cd frontend
cp .env.example .env.local   # 값 채우고
npm install
npm run dev
```

## 문서

- [ERD](docs/ERD.md)
- [API 명세 (외부 신청 목록 + 내부 엔드포인트)](docs/API.md)

## 다음 할 일

- [ ] 카카오모빌리티 길찾기 API 승인 신청 (devtalk.kakao.com)
- [ ] 공공데이터포털 API 4종 + 카카오 지도 API 키 발급
- [ ] `hospital`/`bed_status_history` 등 나머지 엔티티에 대한 컨트롤러 구현
- [ ] 병상+ETA 결합점수 산정 공식 설계
