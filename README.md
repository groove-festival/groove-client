# groove-client

GROOVE 축제 서비스를 위한 모바일 우선 React 클라이언트입니다. 서비스는
루트가 아닌 `/groove` 하위 경로에서 실행됩니다.

## 시작하기

요구 환경은 Node.js `20.19+`와 pnpm `10`입니다.

```sh
pnpm install
pnpm hooks:install
pnpm dev
```

개발 서버는 `http://localhost:5173/groove/`에서 확인합니다. 실제 연동 값은
`.env.example`을 참고해 로컬 전용 `.env.local`에 설정하며 비밀값은 커밋하지
않습니다. `pnpm hooks:install`은 현재 checkout의 `core.hooksPath`를
`.githooks`로 설정해 커밋 메시지 형식을 검사합니다.

## 기술 구성

- TypeScript, React, Vite, React Router
- Tailwind CSS
- React Hook Form, Zod
- TanStack Query, Axios
- Vitest, React Testing Library, Playwright
- Google Analytics, Sentry, Microsoft Clarity 초기화 모듈
- Feature-Sliced Design과 Steiger 구조 검사
- Codex와 Claude Code 공용 AI Agent Workflow

GA·Sentry·Clarity는 `VITE_TELEMETRY_ENABLED=true`이고 각 서비스 식별자가
설정된 production build에서만 초기화됩니다. 기본값은 비활성화입니다.

## 주요 명령

| 명령                 | 용도                                    |
| -------------------- | --------------------------------------- |
| `pnpm dev`           | `/groove/` 개발 서버                    |
| `pnpm hooks:install` | tracked Git hook 활성화                 |
| `pnpm build`         | TypeScript 검사 후 production build     |
| `pnpm lint`          | ESLint                                  |
| `pnpm typecheck`     | TypeScript project 검사                 |
| `pnpm test`          | Vitest 단위·컴포넌트 테스트             |
| `pnpm test:e2e`      | Playwright Chromium E2E                 |
| `pnpm check:fsd`     | Steiger FSD 구조·import 검사            |
| `pnpm check:fast`    | format, lint, typecheck, test, FSD 검사 |
| `pnpm check:full`    | fast gate, build, E2E                   |

## 구조와 문서

- [프론트엔드 프로젝트 컨벤션](CONVENTION.md)
- [제품 요구사항](docs/PRD.md)
- [FSD 아키텍처 규칙](docs/FSD_ARCHITECTURE.md)
- [AI 지원 작업 정책과 기록](docs/AI_AGENT_WORKFLOW.md)
- [Codex 진입점](AGENTS.md)
- [Claude Code 진입점](CLAUDE.md)

현재 `src/`는 공식 FSD 권장에 따라 `app`, `pages`, `shared`만 사용합니다.
`widgets`, `features`, `entities`는 실제 재사용 책임이 생길 때 추가합니다.
