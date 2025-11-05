# Backend

기숙사 룸메 매칭 서비스 백엔드 레포지토리

## 기술스택

- Node.js v20.17.0
- TypeScript
- Supabase (PostgreSQL)

## Runtime

TypeScript 기반 서버 사이드 런타임 환경

## Web Framework

Express / Fastify / NestJS 중 하나를 선택적으로 사용

모듈화된 아키텍처와 미들웨어 기반 확장성 확보

## Database

PostgreSQL (Supabase)

Supabase의 관리형 Postgres 인스턴스 사용

Connection

Connection String (TCP) + Data API (HTTP) 병행 구성

## Security & Schema

Use dedicated API schema for Data API 옵션 활성화

API 전용 스키마(api)를 분리하여 개인정보 보호 강화

## 프로젝트 구조

```c
KNOCK_BACKEND/
├── node_modules/              # 의존성 모듈
├── src/                       # 애플리케이션 소스 코드
│   ├── db/                    # 데이터베이스 관련 폴더
│   │   └── test-db.ts         # Supabase(Postgres) 연결 테스트 스크립트
│   ├── app.controller.ts      # 기본 컨트롤러 (엔드포인트 정의)
│   ├── app.controller.spec.ts # 컨트롤러 테스트 코드
│   ├── app.module.ts          # 루트 모듈 (모듈 의존성 설정)
│   ├── app.service.ts         # 서비스 로직 (비즈니스 로직 담당)
│   └── main.ts                # 애플리케이션 진입점 (NestFactory 부트스트랩)
│
├── test/                      # 테스트 관련 파일
│
├── .env                       # 환경 변수 설정 파일 (DB, API 키 등)
├── .gitignore                 # Git에 포함하지 않을 파일 목록
├── .prettierrc                # 코드 포맷팅 규칙 (Prettier 설정)
├── eslint.config.mjs          # ESLint 설정 파일
├── nest-cli.json              # Nest CLI 설정 파일
├── package.json               # 프로젝트 메타데이터 및 의존성 관리
├── package-lock.json          # 의존성 버전 고정 파일
├── README.md                  # 프로젝트 설명 문서
├── tsconfig.json              # TypeScript 컴파일 설정
└── tsconfig.build.json        # 빌드용 TypeScript 설정
```
