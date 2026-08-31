# Frontend Project Convention

이 문서는 `groove-client`에서 사람과 AI Agent가 함께 따르는 프론트엔드 작업
규칙이다. 저장소의 실제 코드·설정·명령을 기준으로 하며, 상세 FSD 기준은
[`docs/FSD_ARCHITECTURE.md`](docs/FSD_ARCHITECTURE.md)를 단일 기준으로 사용한다.

## 1. 기본 원칙

- 작업 전에 해결할 문제, 범위, 비목표, 완료 기준을 확인한다.
- 관련 코드·테스트·문서를 먼저 읽고 기존 변경을 보존한다.
- 요청 범위를 벗어난 리팩터링, 파일 이동, 의존성 추가, 구조 변경은 하지
  않는다.
- 실행한 검증만 기록하고 실패, 미실행, 수동 확인 필요를 구분한다.
- AI 산출물과 사람이 실제로 결정하거나 수정한 내용을 구분한다. 사람 검토나
  승인 상태 필드는 기록하지 않는다.
- API 키, 토큰, 비밀번호, 개인정보, 원본 사용자 데이터와 비공개 운영 데이터는
  코드·로그·문서·AI 입력에 포함하지 않는다.

## 2. 기술 기준

- 패키지 관리: pnpm 10
- 언어와 UI: TypeScript, React, Vite, Tailwind CSS
- 폼과 검증: React Hook Form, Zod
- 서버 상태와 HTTP: TanStack Query, Axios
- 검증: Vitest, React Testing Library, Playwright, Steiger
- 관측 도구: Google Analytics, Sentry, Microsoft Clarity

버전과 실행 명령의 기준은 `package.json`과 `pnpm-lock.yaml`이다. 라이브러리를
사용한다는 이유만으로 전역 wrapper나 새 레이어를 만들지 않는다.

## 3. Feature-Sliced Design

프론트엔드 파일을 생성·이동·수정하거나 import를 바꿀 때는 먼저 레이어,
slice, segment, public API를 결정한다.

```text
app → pages → widgets → features → entities → shared
```

- 현재 필요한 `app`, `pages`, `shared`만 유지한다. `widgets`, `features`,
  `entities`는 실제 책임과 재사용 경계가 생길 때 추가하며 빈 레이어를 미리
  만들지 않는다.
- 코드는 자신보다 아래 레이어만 import한다. 같은 레이어의 다른 slice를 직접
  import하지 않는다.
- `pages`, `widgets`, `features`, `entities`는 업무 영역별 slice 아래에 `ui`,
  `api`, `model`, `lib`, `config` 같은 목적별 segment를 둔다.
- `app`과 `shared`는 slice 없이 목적별 segment를 둔다. `components`, `hooks`,
  `types`, `utils`처럼 코드 종류만 나타내는 범용 segment는 만들지 않는다.
- slice 또는 sliceless layer의 segment 밖에서 사용할 항목은 해당 `index.ts`
  public API로만 노출한다. 내부 경로를 우회하거나 레이어 전체 barrel을 만들지
  않는다.
- `processes`와 임의의 새 레이어를 사용하지 않는다.

기술별 기본 위치는 다음과 같다.

| 책임                                                | 위치                        |
| --------------------------------------------------- | --------------------------- |
| 앱 조립, provider, 라우팅, 전역 스타일, 분석 초기화 | `app/`                      |
| 라우트 단위 화면과 그 화면에만 쓰이는 로직          | `pages/<page-slice>/`       |
| 여러 화면에서 재사용되는 사용자 행동                | `features/<feature-slice>/` |
| 도메인 개념과 재사용 표현                           | `entities/<entity-slice>/`  |
| 크고 독립적인 재사용 UI 블록                        | `widgets/<widget-slice>/`   |
| Axios 기반, 환경 설정, 범용 기반 코드               | `shared/`                   |

## 4. TypeScript와 React

- TypeScript 타입을 유지하고 불가피한 경우가 아니면 `any` 대신 `unknown`과
  명시적 narrowing을 사용한다.
- React 컴포넌트는 `PascalCase`, Hook은 `use` 접두사를 사용한다.
- 폼 스키마, 요청, 상태는 사용하는 page 또는 feature에 최대한 가까이 둔다.
  여러 slice가 실제로 공유하는 기반만 아래 레이어로 이동한다.
- 서버 상태는 TanStack Query로 관리하고, 공통 Axios 전송 설정은
  `shared/api`에 둔다.
- 사용자 흐름에는 관련 있는 loading, empty, error 상태와 경계 조건을 함께
  고려한다.
- 사용자에게 보이는 문구는 현재 제품 언어인 한국어를 기본으로 하되 같은
  개념에는 같은 용어를 사용한다.

## 5. 환경과 관측 데이터

- 로컬 설정은 `.env.local`에 두고 커밋하지 않는다. 공유 가능한 키 이름과
  안전한 예시는 `.env.example`에만 둔다.
- GA·Sentry·Clarity에는 학번, 이름, 입금자명, 폼 값, 테이블 코드 같은
  민감하거나 식별 가능한 값을 이벤트, 오류, breadcrumb로 전송하지 않는다.
- 관측 도구는 저장소의 기존 opt-in 조건을 유지한다. 실제 수집을 활성화할
  때는 동의, 마스킹, 보존 기간을 별도로 확인한다.

## 6. 테스트와 완료 검증

변경 위험에 맞는 가장 작은 테스트부터 실행한다. 버그 수정에는 가능한 경우
실패를 재현하는 회귀 테스트를 추가한다.

문서·Agent 지침만 바꾼 작업은 애플리케이션 build나 E2E를 자동 실행하지
않는다. 변경된 Markdown의 format과 diff 오류처럼 직접 관련된 검사만 먼저
실행한다.

프론트엔드 소스, 파일 배치, public API, import를 바꾼 작업은 종료 직전에
다음 명령으로 FSD 경계를 확인한다.

```sh
pnpm check:fsd
```

관련 테스트나 타입 검사를 개별 실행할 수 있으면 그 결과부터 확인한다.
여러 소스 영역을 변경했거나 commit·PR 전에 저장소 전체 신호가 필요할 때
fast gate로 확장한다.

```sh
pnpm check:fast
```

라우팅, 앱 조립, 빌드 설정, 의존성, 핵심 사용자 흐름처럼 production build나
브라우저 동작까지 영향을 주는 변경만 full gate로 확장한다.

```sh
pnpm check:full
```

검사 실패를 숨기기 위해 규칙을 끄거나 테스트를 skip하거나 assertion을
약화하지 않는다. 실패 또는 미실행 항목은 원인과 영향 범위를 함께 남긴다.

## 7. Git과 커밋 메시지

커밋 메시지 첫 줄은 다음 형식을 사용한다.

```text
<type>(<scope>): <summary>
```

`scope`는 선택 사항이며 소문자 영문, 숫자, `/`, `-`만 사용한다. `summary`는
변경 결과가 드러나는 구체적인 한국어 문장을 기본으로 한다.

| type       | 용도                           |
| ---------- | ------------------------------ |
| `feat`     | 사용자 기능 추가               |
| `fix`      | 버그 수정                      |
| `refactor` | 동작을 바꾸지 않는 구조 개선   |
| `docs`     | 문서 변경                      |
| `design`   | 화면 또는 디자인 규칙 변경     |
| `chore`    | 설정, 의존성, 개발 환경 변경   |
| `test`     | 테스트 추가 또는 수정          |
| `style`    | 동작과 무관한 코드 스타일 변경 |
| `perf`     | 성능 개선                      |
| `ci`       | CI 설정 변경                   |

예시:

```text
feat(application): 가요제 신청 기능 추가
fix(query): 재시도 후 로딩 상태가 남는 문제 수정
docs(fsd): 종료 검증 규칙 추가
```

저장소를 받은 뒤 checkout마다 한 번 실행해 tracked hook을 활성화한다.

```sh
pnpm hooks:install
```

`.githooks/commit-msg`가 shell에서 메시지 첫 줄을 직접 검사해 위 형식에 맞지
않는 메시지를 거부한다. `post-commit`은 현재 HEAD를 Notion 기록 대기로
표시하고 `pre-push`는 확인된 Notion 기록이 없으면 push를 막는다. 별도 hook
패키지는 사용하지 않는다.

팀원은 checkout마다 자신의 이름 하위 페이지를 설정한다.

```sh
pnpm notion:setup -- "<내 Notion 하위 페이지 URL>"
```

사람 이름이나 개인 페이지 매핑, OAuth 인증 정보는 저장소에 커밋하지 않는다.
여러 커밋을 한 작업으로 나누었다면 마지막 계획 커밋 뒤, push 전에 한 개의
Notion 기록으로 묶고 포함된 commit hash를 모두 적는다. MCP 장애나 긴급한
예외로 guard를 우회해야 할 때만 아래 one-shot 명령을 사용하고, 미동기화
상태와 이유를 숨기지 않는다.

```sh
git -c aiworklog.skip=true push
```

관련 없는 변경을 한 커밋에 섞거나 비밀정보·개인 설정을 커밋하지 않는다. AI
Agent는 사용자가 명시적으로 요청하고 커밋 계획을 승인하기 전에는 staging이나
commit을 실행하지 않는다.

## 8. 문서와 작업 기록

- Issue는 `.github/ISSUE_TEMPLATE/`의 `디자인`, `리팩토링`, `버그`, `기능`,
  `문서 작업` Form 중 목적에 맞는 항목을 사용한다.
- PR은 `.github/pull_request_template.md`의 관련 이슈, 작업 내용, 작업 방식의
  이유, AI와 정리한 문서화·트러블슈팅 내용, 실제 검증을 간결하게 작성한다.
- 제품 동작과 사용자 흐름은 `docs/PRD.md`, 구조는
  `docs/FSD_ARCHITECTURE.md`, AI 지원 작업 증거는
  `docs/AI_AGENT_WORKFLOW.md`의 정책과 `docs/ai-worklogs/YYYY-MM.md`의 월별
  기록으로 분리해 관리한다. 과거 작업 기록은 감사·수정 작업이 아니면 읽지
  않는다.
- 실제 Issue, PR, Discussion이 없으면 링크를 만들지 않는다.
- 존재하지 않는 회의, 결정, 기여, 검토, 승인, 테스트 결과를 만들지 않는다.
- 완료 보고에는 변경 파일, 실행한 검증과 결과, 실패·미실행, 남은 위험,
  보존한 기존 변경, 수행하지 않은 commit·push·deploy를 적는다.

## 9. 종료 체크리스트

- 요청 범위와 완료 기준을 충족했는가?
- FSD 레이어, slice, segment, public API와 import 방향이 맞는가?
- `pnpm check:fsd`를 마지막 변경 뒤 실행했는가?
- 관련 타입, 테스트, error/loading/empty 상태를 확인했는가?
- 위험에 비해 과도한 fast/full gate를 자동 실행하지 않았는가?
- PRD, 환경 예시, FSD 문서 등 변경된 계약을 동기화했는가?
- 실패, 미실행, 수동 확인 필요, 남은 위험을 사실대로 남겼는가?
