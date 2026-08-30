# Feature-Sliced Design 아키텍처

이 문서는 GROOVE 클라이언트의 코드 배치와 import 경계를 정의한다. 새로운
기능을 추가할 때는 가장 낮고 응집도 높은 책임에 코드를 두고
`pnpm check:fsd`로 구조를 검증한다.

## 1. 기본 결정

Feature-Sliced Design의 표준 레이어를 사용한다. 현재 필요한 레이어는
`app`, `pages`, `shared`이며, 빈 디렉터리를 미리 만들지 않는다.

```text
src/
├─ app/       # 앱 조립, 라우팅, 전역 스타일, 분석 초기화, 진입점
├─ pages/     # 라우트 단위 화면 slice
└─ shared/    # 외부 연동, 환경 설정, 재사용 가능한 기반 코드
```

제품 기능이 생기면 아래 순서를 유지하면서 필요한 레이어만 추가한다.

```text
app → pages → widgets → features → entities → shared
```

`processes`는 공식 명세에서 폐기된 레이어이므로 사용하지 않는다. 임의의
새 레이어도 만들지 않는다.

## 2. 의존성 규칙

- 코드는 자신보다 아래 레이어만 import할 수 있다.
- 같은 레이어의 서로 다른 slice는 직접 import하지 않는다.
- `app`과 `shared`는 slice 없이 목적 중심 segment를 직접 둔다.
- `pages`, `widgets`, `features`, `entities`는 업무 영역별 slice를 먼저 두고
  그 안을 `ui`, `api`, `model`, `lib`, `config` 같은 목적별 segment로 나눈다.
- `components`, `hooks`, `types`, `utils`처럼 코드 종류만 나타내는 범용
  segment 이름은 만들지 않는다.

예를 들어 `features/song-request`는 `entities/song`과 `shared`를 사용할 수
있지만 다른 `features/*` slice나 `pages`를 사용할 수 없다.

## 3. Public API

- 외부 slice에서 사용할 항목은 slice 루트의 `index.ts`로만 공개한다.
- `app`과 `shared`에서는 각 segment 루트의 `index.ts`를 public API로 둔다.
- 레이어 루트에 전체 레이어를 재노출하는 `index.ts`는 만들지 않는다.
- 같은 slice 내부에서는 상대 경로 import를 사용한다.
- 다른 slice나 레이어에서는 `@/` alias와 public API를 사용한다.

```ts
// 허용: pages/home slice의 public API
import { HomePage } from "@/pages/home";

// 금지: slice 내부 구현 우회
import { HomePage } from "@/pages/home/ui/HomePage";
```

## 4. 기술별 배치 기준

| 책임                                 | 기본 위치                           |
| ------------------------------------ | ----------------------------------- |
| 앱 진입점, 전역 조립                 | `app/entrypoint`, `app/composition` |
| React Router 구성                    | `app/routes`                        |
| GA·Sentry·Clarity 초기화             | `app/analytics`                     |
| 전역 Tailwind 스타일                 | `app/styles`                        |
| 라우트 화면                          | `pages/<page-slice>`                |
| Axios 인스턴스와 공통 전송 설정      | `shared/api`                        |
| 환경변수와 전역 설정                 | `shared/config`                     |
| 독립적인 기반 라이브러리             | `shared/lib/<purpose>`              |
| 여러 화면에서 재사용되는 사용자 행동 | `features/<feature-slice>`          |
| 도메인 개념과 표현                   | `entities/<entity-slice>`           |
| 크고 독립적인 재사용 UI 블록         | `widgets/<widget-slice>`            |

React Hook Form, Zod, TanStack Query를 사용한다는 이유만으로 전역 wrapper나
별도 레이어를 만들지 않는다. 폼 스키마와 요청은 해당 기능 slice에 두고,
여러 slice에 정말 공통인 기반만 `shared`로 내린다.

## 5. `/groove` 경로와 분석 데이터

- Vite `base`와 React Router `basename`은 `/groove`를 기준으로 한다.
- 정적 자산, 브라우저 테스트, 이후 추가할 QR 절대 URL도 같은 기준을
  사용한다.
- GA·Sentry·Clarity는 기본 비활성화이며 production 환경에서 명시적으로
  활성화해야 한다.
- URL의 테이블 코드, 학번, 이름, 입금자명, 폼 값 등 민감하거나 식별 가능한
  값을 분석 이벤트·오류·breadcrumb에 넣지 않는다.
- 실제 사용자 추적을 켜기 전에는 동의 방식, 마스킹, 보존 기간을 별도로
  확인한다.

## 6. 검증

모든 프론트엔드 작업은 마지막 코드·import 변경 뒤, handoff 전에
`pnpm check:fsd`를 실행한다. 구조를 바꾼 작업은 다음 관련 검사도 실행한다.

```sh
pnpm check:fsd
pnpm typecheck
pnpm test
```

`pnpm check:fsd`는 공식 FSD 규칙을 구현한 Steiger의 recommended 설정으로
다음을 검사한다.

- 상위 레이어 및 동일 레이어 다른 slice import
- public API 우회와 누락
- 잘못된 레이어·segment 구조
- 레이어 루트 public API
- 폐기된 `processes` 사용

Steiger는 beta 도구이므로 버전은 `pnpm-lock.yaml`로 고정한다. 도구 경고를
무조건 끄지 말고 공식 FSD 문서와 실제 코드 책임을 먼저 확인한다. 예외가
필요하면 이유와 범위를 이 문서와 `steiger.config.ts`에 함께 남긴다.

## 7. AI 작업 규칙

Codex와 Claude Code는 코드 생성·이동·리뷰 시 `project-fsd` Skill을 사용한다.
새 파일을 만들기 전에 레이어, slice, segment, public API를 결정하고 작업 후
마지막 변경 뒤 `pnpm check:fsd`를 종료 검증으로 실행한다. 자동 검사 통과만으로
제품 동작이 검증되는 것은 아니므로 변경 위험에 맞는 타입·단위·컴포넌트·E2E
검사를 별도로 수행한다.

## 8. 공식 참고 자료

- [FSD Layers](https://feature-sliced.design/docs/reference/layers)
- [FSD Slices and segments](https://feature-sliced.design/docs/reference/slices-segments)
- [FSD Public API](https://feature-sliced.design/docs/reference/public-api)
- [Steiger](https://github.com/feature-sliced/steiger)
