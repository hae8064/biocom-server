# NestJS Playground API

상담 예약 시스템 API 서버. 상담사의 슬롯 관리, 예약 링크 발급, 신청자의 예약 및 상담 기록 관리 기능을 제공합니다.

## 기술 스택

- **NestJS** (Node.js)
- **TypeORM** + PostgreSQL
- **JWT** 인증
- **Swagger** API 문서

## 사전 요구사항

- Node.js 18+
- pnpm
- Docker (PostgreSQL용, 또는 로컬 PostgreSQL)

## 실행 가이드

### 1. 의존성 설치

```bash
pnpm install
```

### 2. 환경 변수 설정

```bash
cp .env.dev .env
```

`.env`에서 다음 항목을 실제 값으로 수정하세요:

| 변수          | 설명              | 기본값                     |
| ------------- | ----------------- | -------------------------- |
| `DB_HOST`     | PostgreSQL 호스트 | localhost                  |
| `DB_PORT`     | PostgreSQL 포트   | 5436 (docker-compose 기본) |
| `DB_USER`     | DB 사용자         | postgres                   |
| `DB_PASSWORD` | DB 비밀번호       | (필수)                     |
| `DB_NAME`     | DB 이름           | biocom                     |
| `JWT_SECRET`  | JWT 서명 키       | (필수)                     |
| `PORT`        | 서버 포트         | 8008                       |

### 3. 실행

```bash
# PostgreSQL + Nest 서버 동시 실행 (권장)
pnpm run dev
```

또는 별도 실행:

```bash
pnpm run db:start      # PostgreSQL 컨테이너만 기동
pnpm run start:dev     # Nest 서버 실행 (watch 모드)
```

### 4. 접속

- **API**: http://localhost:8008 (PORT 값에 따라 변경)
- **Swagger 문서**: http://localhost:8008/docs

## API 개요

### 인증

- `POST /auth/register` - 회원가입 (ADMIN/COUNSELOR)
- `POST /auth/login` - 로그인 (JWT 발급)

### 관리자 - 슬롯

- `GET /admin/slots` - 슬롯 목록 (`?includeBookings=true` 시 예약 포함)
- `GET /admin/slots/:id` - 슬롯 단건 조회
- `GET /admin/slots/:slotId/bookings` - 슬롯별 예약자 목록
- `POST /admin/slots` - 슬롯 생성
- `PATCH /admin/slots/:id` - 슬롯 수정
- `DELETE /admin/slots/:id` - 슬롯 삭제

### 관리자 - 예약 링크

- `POST /admin/email-links` - 예약 링크(토큰) 생성 및 이메일 발송

### 관리자 - 상담 기록

- `GET /admin/bookings/:bookingId/session` - 상담 기록 조회
- `POST /admin/bookings/:bookingId/session` - 상담 기록 저장 (notes, outcome 등)

### 공개 (토큰 필요)

- `GET /public/reserve?token=xxx` - 예약 가능 슬롯 조회 (`date` 옵션 지원)
- `POST /public/bookings` - 예약 생성

> 관리자 API는 `Authorization: Bearer <JWT>` 헤더가 필요합니다.

## 기타 스크립트

```bash
pnpm run build        # 빌드
pnpm run start        # 프로덕션 실행 (node dist/main)
pnpm run db:stop      # PostgreSQL 컨테이너 중지
pnpm run lint         # ESLint
```
