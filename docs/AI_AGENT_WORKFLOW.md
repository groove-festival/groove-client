# AI Agent Workflow

> “AI가 무엇을 대신 결정했는지가 아니라, 담당자가 어떤 맥락에서 AI를 사용했고 그 결과를 어떻게 검토·수정·검증했는지 기록한다.”

기본 원칙은 단순하다. AI 산출물은 초안이며 최종 판단은 담당자에게 있다.
이 문서는 기술 스택이나 제품 아키텍처를 정의하지 않고 AI 지원 작업의
추적 가능성, 담당자의 실제 결정·수정, 실제 검증 증거를 정의한다. 사람의
검토 여부나 승인 상태는 작업 기록에 남기지 않는다.

## 목차

1. [목적과 기록 범위](#1-목적과-기록-범위)
2. [책임 경계](#2-책임-경계)
3. [표준 작업 흐름](#3-표준-작업-흐름)
4. [작업 기록](#4-작업-기록)
5. [민감 정보와 권한](#5-민감-정보와-권한)
6. [Codex와 Claude Code 공통 운영](#6-codex와-claude-code-공통-운영)
7. [품질 게이트](#7-품질-게이트)
8. [Issue·PR·리뷰 통합](#8-issuepr리뷰-통합)
9. [평가와 개선](#9-평가와-개선)
10. [참고 자료](#10-참고-자료)
11. [작업 기록 위치](#11-작업-기록-위치)

## 1. 목적과 기록 범위

이 Workflow의 대상은 AI가 프로젝트 산출물이나 결정에 실질적 영향을 준
작업이다. 기록은 다음 여섯 가지 증거를 분리해 담당자가 결과를 재검토할 수
있게 한다.

1. 해결하려던 사용자 문제와 의도한 결과
2. AI가 실제로 받은 요구사항·코드·테스트·문서 맥락
3. AI가 실제로 제안하거나 생성한 산출물
4. 사람이 실제로 결정하거나 수정한 내용
5. 실제로 수행한 자동·수동 검증과 결과
6. 실패, 미실행, 수동 확인 필요 사항, 남은 위험

### 기록 대상

- 제품·기능 기획, 코드 작성과 수정, 구조·기술 결정
- 테스트 설계나 테스트 데이터 생성, 디버깅과 장애 원인 분석
- 문서·명세 작성, 코드 리뷰와 보안 검토
- 사용자에게 제공되는 AI 생성 결과

### 기본 비기록 대상

- 프로젝트 결과에 영향을 주지 않은 단순 질의
- 의미가 바뀌지 않는 사소한 오탈자 확인
- 산출물이나 의사결정에 반영되지 않은 탐색 대화

기준은 대화 횟수가 아니라 프로젝트 산출물이나 결정에 대한 실질적
영향이다. 과거 작업은 회의, 사람의 결정·수정, 명령 결과를 추측해 소급
기록하지 않는다.

## 2. 책임 경계

| 주체        | 책임                                                              | 책임이 아닌 것                                       |
| ----------- | ----------------------------------------------------------------- | ---------------------------------------------------- |
| AI Agent    | 제공된 맥락 조사, 초안·제안·변경 생성, 실행한 검증 결과 전달      | 최종 제품 판단, 실행하지 않은 검증 보증              |
| 담당자      | 문제·범위 결정, AI 산출물 판단·수정, 위험 수용, 최종 결정         | AI 자기 점검이나 자동 검사에 사람의 이름만 붙이는 일 |
| 자동 검증   | lint, format, typecheck, test, build, CI 등 관찰 가능한 신호 제공 | 사람의 맥락 판단, 요구사항 결정, 사용자 가치 확인    |
| 저장소 규칙 | 허용된 명령, 품질 기준, 권한·협업 경계 제공                       | 존재하지 않는 팀 관행이나 명령의 근거                |

AI 자기 점검이나 다른 AI의 교차 점검은 AI 산출물에 포함할 수 있다. 자동
검사 결과는 검증 증거로만 기록한다. 어느 경우에도 사람의 행동을 추측해
추가하지 않는다.

## 3. 표준 작업 흐름

1. 가장 가까운 지침과 현재 Git 변경을 확인하고, 결정에 직접 필요한 코드,
   테스트, 명세만 읽는다.
2. 사용자 문제, 작업 범위, 비목표, 완료 기준을 사실에 근거해 정리한다.
3. 영향 범위, 위험, 변경 파일과 가장 작은 Skill·문서 집합을 확인한다.
4. 기존 패턴을 지키며 필요한 구현이나 문서 변경을 최소 범위로 수행한다.
5. 가장 작고 관련성 높은 검증부터 실행하고 위험에 따라 범위를 넓힌다.
6. 결과를 `통과`, `실패`, `미실행`, `수동 확인 필요`로 구분한다.
7. 기록 대상이면 `project-ai-worklog` 기준으로 현재 월의 파일에 증거를
   기록하되 과거 기록은 읽지 않는다.
8. commit과 push가 함께 승인되고 checkout이 Notion 기록에 opt-in했다면
   로컬 기록을 포함해 최종 계획 commit을 만든 뒤 `project-notion-worklog`로
   개인 하위 페이지에 한 건을 작성하고 다시 읽어 확인한다.
9. Notion 기록 확인 뒤에만 동기화 표시를 남기고 push한다.
10. 변경, 검증, 보존한 기존 변경, 실패, 남은 위험을 사용자에게 보고한다.

삭제, 배포, 프로덕션 변경, 외부 메시지, 비용 발생 작업은 이 흐름만으로
허가되지 않는다. 사용자의 별도 승인과 기존 저장소 규칙이 필요하다.

## 4. 작업 기록

### 저장 위치와 로딩 범위

- 이 문서는 기록 정책과 템플릿만 보관한다.
- 실제 항목은 `docs/ai-worklogs/YYYY-MM.md`에 월별로 추가한다.
- 새 월 파일의 제목은 `# AI worklog — YYYY-MM`으로 시작한다.
- 새 항목 작성 시 현재 월 파일의 끝만 확인한다. 감사, 오류 수정, 과거 결정
  조사 작업이 아니면 이전 월 파일이나 기존 항목을 AI 맥락에 넣지 않는다.
- Issue나 PR이 이미 같은 증거를 충분히 담고 있어도 저장소 정책상 기록 대상인
  경우에는 링크와 간결한 요약만 남기고 내용을 장문으로 복제하지 않는다.

### 작성 규칙

- `입력 맥락`에는 AI가 실제로 참고한 요구사항, 코드, 테스트, 문서만
  적는다. 민감 정보 원문 대신 안전한 경로·범주·요약을 사용한다.
- `AI 제안 또는 산출물`에는 실제 생성·수정·제안 내용과 주요 파일을
  적는다.
- `사람이 실제로 결정·수정한 내용`에는 확인 가능한 사람의 결정이나 직접
  수정만 적는다. 해당 내용이 없으면 `없음`으로 두며 검토 여부나 승인
  상태를 기록하지 않는다.
- AI Agent가 다른 AI Agent의 출력을 확인한 내용은 `AI 제안 또는 산출물`
  아래에 적고 사람의 행동으로 표현하지 않는다.
- `검증 결과`에는 실제 명령·수동 확인, 결과, 실패 원인, 미실행 이유를
  적는다. 예상 결과를 실제 결과처럼 쓰지 않는다.
- 실패한 검증은 증상, 확인된 원인, 현재 상태를 함께 적는다. 테스트 skip,
  assertion 약화, 무관한 mock으로 실패를 숨기지 않는다.
- `남은 확인 사항`에는 필요한 수동 확인, 환경 부족, 해결되지 않은 실패,
  잔여 위험을 구분해 적는다.
- 관련 자료가 실제로 없으면 `없음`이라고 쓴다.

### 표준 템플릿

```markdown
### YYYY-MM-DD - 작업 제목

- 담당자:
- 사용한 Agent / Skill:
- 사용 목적:
- 입력 맥락:
- AI 제안 또는 산출물:
- 사람이 실제로 결정·수정한 내용:
- 검증 결과:
- 남은 확인 사항:
- 관련 Issue / PR / Discussion:
```

### 검증 상태 표현

| 상태             | 사용 조건                                     |
| ---------------- | --------------------------------------------- |
| `통과`           | 실제 실행한 검증이 성공함                     |
| `실패`           | 실제 실행한 검증이 실패함                     |
| `미실행`         | 검증하지 않았으며 이유와 미확인 범위를 기록함 |
| `수동 확인 필요` | 사람이나 특정 환경에서 확인해야 함            |
| `해당 없음`      | 적용되지 않는 이유가 명확함                   |

사람 검토·승인 상태는 이 표와 작업 기록에 추가하지 않는다. 자동 검증은
실제로 관찰한 결과만 위 상태로 기록한다.

### 팀 Notion 기록

- 저장소 월별 worklog가 추적 가능한 원본이고 Notion은 읽기 좋은 팀 공유
  사본이다.
- 부모 페이지의 팀원별 하위 페이지 중 현재 checkout에 설정된 한 곳에만
  기록한다. 팀원의 이름과 페이지 매핑은 저장소에 넣지 않는다.
- 한 번의 push에 여러 계획 commit이 포함되면 한 개의 Notion 페이지로
  묶고 모든 commit hash를 남긴다.
- 페이지는 `작업 내용`, `결정과 이유`, `AI와 정리한 내용`, `검증`, `남은
사항`을 사용한다. 대화 원문, 반복 질문, 결과에 영향 없는 시행착오는
  복사하지 않는다.
- 실제 작성 뒤 페이지를 다시 읽고 제목, 필수 구획, commit hash, 검증 표현,
  민감 정보 부재를 확인한다. 가능한 환경에서는 첫 화면과 목록 구획도
  시각적으로 확인한다.
- 작성·재조회가 실패하면 동기화 표시를 남기지 않는다. `pre-push` hook은
  현재 HEAD의 확인 증거가 없으면 push를 막는다.

## 5. 민감 정보와 권한

- API 키, 토큰, 비밀번호, 개인정보, 원본 사용자 데이터, 비공개 운영
  데이터는 AI 입력, 작업 기록, 예시, 커밋 대상 파일에 포함하지 않는다.
- 필요한 맥락은 안전한 경로, 데이터 범주, 비식별 요약으로 대체한다.
- 외부 도구·MCP·Plugin은 외부 시스템 접근이 실제로 필요할 때만 최소
  권한으로 사용한다.
- 비밀값이 출력되면 기록에 복사하지 말고 노출 범위를 제한해 기존 보안
  절차에 따라 처리한다.
- 기존 사용자·팀원 변경을 임의로 되돌리거나 덮어쓰지 않는다.
- commit, push, branch·PR 생성, 배포, 삭제, 프로덕션 변경, 외부 쓰기는
  사용자 요청과 승인 범위를 각각 확인한다.
- `pnpm notion:setup`으로 현재 checkout의 개인 대상 페이지를 설정한 것은
  해당 페이지 아래에 이 Workflow의 작업 기록을 게시하는 opt-in이다. 다른
  페이지나 다른 외부 시스템 쓰기 권한으로 확대하지 않는다.
- 사용자가 commit을 요청한 경우에도 먼저 commit 순서, 메시지, 포함 파일,
  분리 이유, 각 검증 방법을 제시한다. 사용자가 그 계획을 명시적으로
  승인하기 전에는 `git add`나 `git commit`을 실행하지 않는다.
- 새로운 런타임·패키지 의존성이 필요하면 기존 저장소 절차와 사용자
  승인을 먼저 확인한다.

### Subagent·외부 도구·Hook

- Subagent는 저장소 탐색, 독립 리뷰, 긴 로그 분석처럼 분리 가능한
  읽기 중심 작업에만 사용한다. 같은 파일을 동시에 수정하지 않도록
  소유권과 병합 순서를 정한다.
- Subagent의 결과도 AI 산출물이며 사람의 행동으로 기록하지 않는다.
- MCP·Plugin은 외부 시스템 접근이 실제로 필요할 때만 최소 권한으로
  연결한다. 비밀정보를 설정이나 로그에 남기지 않는다.
- Hook과 CI는 format, 검증, 드리프트 확인처럼 결정론적 강제가 반복해서
  가치 있을 때 기존 구조에 통합한다.
- Workflow 설치만을 이유로 프로덕션 조작, 배포, 삭제, 외부 쓰기를
  실행하지 않는다.

## 6. Codex와 Claude Code 공통 운영

### 최소 맥락 원칙

- Codex와 Claude Code는 상시 계약만 먼저 읽고, 현재 결정에 필요한 문서와
  Skill만 추가로 연다.
- 좁은 단일 파일 작업이나 단순 질의에는 `project-workflow`를 자동으로
  호출하지 않는다. 여러 단계·영역을 조율해야 할 때만 사용한다.
- Skill 라우터에 나열됐다는 이유만으로 모든 전문 Skill을 함께 읽지 않는다.
- 과거 작업 로그는 기본 입력 맥락이 아니다.

### 라우터와 단일 원본

| 항목            | Codex                                  | Claude Code                             |
| --------------- | -------------------------------------- | --------------------------------------- |
| 상시 지침       | 루트 `AGENTS.md`와 더 가까운 범위 지침 | `CLAUDE.md`가 루트 `AGENTS.md`를 import |
| Skill 호출      | 가장 좁은 `$project-*`                 | 가장 좁은 `/project-*`                  |
| Skill 탐색 경로 | `.agents/skills/`                      | `.claude/skills/`                       |
| Skill 원본      | `.agents/skills/`                      | 원본에서 생성된 호환 사본               |
| 기록 기준       | 이 문서의 템플릿과 검증 상태 의미      | 동일                                    |
| Notion MCP 설정 | `.codex/config.toml`                   | `.mcp.json`                             |
| 개인 대상·OAuth | checkout·Codex 사용자 로컬 설정        | checkout·Claude 사용자 로컬 설정        |

`.agents/skills/`만 사람이 수정한다. `.claude/skills/`의 manifest 관리
대상은 생성물이며 직접 수정하지 않는다. 동기화 스크립트는
`.agents/skills/managed-skills.txt`에 명시된 디렉터리만 다루고, 다른
Claude Skill은 삭제하거나 덮어쓰지 않는다.

Windows:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/sync-agent-skills.ps1 -Mode Sync
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/sync-agent-skills.ps1 -Mode Check
```

POSIX:

```sh
sh scripts/sync-agent-skills.sh sync
sh scripts/sync-agent-skills.sh check
```

두 구현은 추가 패키지 없이 각 플랫폼의 기본 shell과 표준 파일 도구를
사용한다. 현재 저장소에는 CI가 없으므로 드리프트 검사는 로컬 명령으로만
구성했다. CI가 도입되면 `check` 명령을 기존 검증 단계에 추가할지 팀이
결정한다.

공식 FSD 규칙을 모든 프론트엔드 변경에 반복 적용하기 위해 `project-fsd`를
추가했다. `project-debugging`, `project-security`, `project-deployment` 같은
다른 Optional Skill은 실제 반복 실패나 운영 필요가 확인될 때 기존 Skill과
중복되지 않는 범위에서 추가한다.

## 7. 품질 게이트

### 현재 저장소 기준

2026-08-31 기준 `package.json`, pnpm lockfile, Vite, TypeScript, Vitest,
Playwright, ESLint, Prettier, Tailwind, Steiger 설정이 존재한다.

| 범주                                | 확인된 명령                          |
| ----------------------------------- | ------------------------------------ |
| 설치                                | `pnpm install --frozen-lockfile`     |
| 로컬 Git hook 활성화                | `pnpm hooks:install`                 |
| 개발 서버                           | `pnpm dev`                           |
| production build                    | `pnpm build`                         |
| lint / format                       | `pnpm lint`, `pnpm format:check`     |
| typecheck                           | `pnpm typecheck`                     |
| 단위·컴포넌트 테스트                | `pnpm test`                          |
| E2E 브라우저 테스트                 | `pnpm test:e2e`                      |
| FSD 구조·import                     | `pnpm check:fsd`                     |
| 애플리케이션 fast/full gate         | `pnpm check:fast`, `pnpm check:full` |
| Workflow Skill 동기화               | 위 `Sync` 명령                       |
| Workflow Skill 드리프트·frontmatter | 위 `Check` 명령                      |
| Notion 대상·동기화 상태             | `pnpm notion:status`                 |

명령은 실행 전에 현재 `package.json`, 설정, CI를 다시 확인한다. CI는 아직
없으므로 위 명령은 현재 로컬 품질 게이트다.

### Gate 선택과 보고

- Targeted gate는 문서 format, 관련 테스트 파일, 필요한 typecheck, FSD 또는
  생성물 드리프트처럼 좁은 변경을 직접 검증한다.
- Fast gate는 여러 소스 영역을 변경했거나 commit·PR 판단에 저장소 전체의
  format, lint, typecheck, unit test, FSD 신호가 필요할 때 사용한다.
- Full gate는 전체 테스트, 통합·E2E·브라우저 테스트, production build,
  마이그레이션, 보안·의존성 검사 중 저장소가 실제 제공하는 항목으로
  구성한다.
- 현재 fast gate는 format check, lint, typecheck, Vitest, Steiger이며 full
  gate는 fast gate, production build, Playwright Chromium E2E다.
- 문서·Skill 변경이라는 이유만으로 애플리케이션 build나 E2E를 실행하지
  않는다. handoff 자체도 fast/full gate의 trigger가 아니다.
- 모든 결과에는 명령, `통과`/`실패`, 실패 원인, `미실행` 이유,
  미확인 영향 범위를 남긴다.

## 8. Issue·PR·리뷰 통합

현재 저장소는 `.github/ISSUE_TEMPLATE/` 아래의 `디자인`, `리팩토링`, `버그`,
`기능`, `문서 작업` Issue Form과 `.github/pull_request_template.md`를 사용한다.
Issue Form은 문제와 원하는 결과처럼 작업 시작에 필요한 최소 정보만 받는다.

PR에는 다음 내용을 간결하게 남긴다.

- 관련 이슈
- 작업 내용
- 해당 작업 방식을 선택한 이유
- AI와 논의하며 정리한 결정, 시행착오, 트러블슈팅 등의 문서화 내용
- 실제 실행한 검증과 결과

AI 대화 원문을 복사하지 않고 결정에 영향을 준 안전한 요약만 적는다. 같은
증거를 월별 worklog에 다시 장문으로 복제하지 말고 관련 PR과 요약을 남긴다.

AI 점검은 기존 팀 절차를 대체하지 않는다. 실제 Issue, PR, Discussion이
없다면 작업 기록에는 `없음`이라고 쓴다. 사람 검토·승인 상태 필드는
추가하지 않는다.

## 9. 평가와 개선

현재 별도 eval 인프라는 없다. 아래는 대표 작업을 이용한 초기 평가
계획이며, 아직 실행하지 않았다.

| 대표 사례                | 관찰할 증거                             | 현재 상태           |
| ------------------------ | --------------------------------------- | ------------------- |
| 작은 기능 추가           | 범위·비목표, 최소 변경, 관련 검증       | 계획만 작성, 미실행 |
| 버그 수정과 회귀 테스트  | 재현 증거, 회귀 테스트, 실패 전후 상태  | 계획만 작성, 미실행 |
| API 계약 변경            | 구현·PRD·명세·예제 동기화               | 계획만 작성, 미실행 |
| DB 또는 데이터 모델 변경 | 마이그레이션·호환성·롤백 확인           | 계획만 작성, 미실행 |
| 설정·기본값 변경         | 환경별 영향과 문서 동기화               | 계획만 작성, 미실행 |
| 실패한 test/CI 진단      | 실패 보존, 확인 원인과 미확인 원인 분리 | 계획만 작성, 미실행 |
| 리뷰 전용 작업           | severity·근거·위치·재현 방법            | 계획만 작성, 미실행 |
| 문서 전용 작업           | 사실 출처, 링크, 실제 결정·수정         | 계획만 작성, 미실행 |
| 민감 정보 가능 입력      | 비식별 요약과 최소 권한                 | 계획만 작성, 미실행 |
| 사람의 결정이 없는 작업  | 상태 추측 없이 AI·검증 증거만 기록      | 계획만 작성, 미실행 |
| 일부 검증 실패·미실행    | 완료 상태 과장 없이 잔여 위험 기록      | 계획만 작성, 미실행 |
| Codex·Claude 동일 요청   | Skill 선택과 기록 의미의 일치           | 계획만 작성, 미실행 |

평가에서는 올바른 Skill 선택, 범위 밖 변경 수, 검증과 기록의 일치,
AI 산출물과 실제 사람의 결정·수정 구분, 실패·미실행·남은 위험 누락,
문서·명세 드리프트, first-pass 성공률, 사람 개입 원인, 완료 시간·비용을
관찰한다.
실제로 실행한 사례와 결과가 없으면 평가를 통과했다고 표현하지 않는다.

다음 상황에서 Workflow를 재검토한다.

- 같은 유형의 기록 누락이나 검증 실패가 반복됨
- 애플리케이션 기술 스택, 패키지 명령, CI, Issue·PR 절차가 도입됨
- Codex 또는 Claude Code의 지침·Skill 탐색 방식이 변경됨
- Skill 원본과 호환 사본의 드리프트가 발견됨

## 10. 참고 자료

공식 동작과 공통 Skill 형식을 확인하기 위해 다음 자료를 사용했다. 공개
저장소의 내용을 복사해 적용하지 않았다.

- [OpenAI Codex `AGENTS.md`](https://developers.openai.com/codex/guides/agents-md)
- [OpenAI Codex Skills](https://developers.openai.com/codex/skills)
- [OpenAI Codex MCP](https://developers.openai.com/codex/mcp)
- [Agent Skills Specification](https://agentskills.io/specification)
- [Claude Code Skills](https://code.claude.com/docs/en/slash-commands)
- [Claude Code MCP](https://code.claude.com/docs/en/mcp)
- [Claude Code `CLAUDE.md`](https://docs.anthropic.com/en/docs/claude-code/memory)
- [Notion MCP](https://developers.notion.com/guides/mcp/get-started-with-mcp)
- [GitHub Issue Form syntax](https://docs.github.com/en/communities/using-templates-to-encourage-useful-issues-and-pull-requests/syntax-for-issue-forms)
- [GitHub Pull Request templates](https://docs.github.com/en/communities/using-templates-to-encourage-useful-issues-and-pull-requests/creating-a-pull-request-template-for-your-repository)

## 11. 작업 기록 위치

실질적인 AI 지원 작업 기록은 `docs/ai-worklogs/YYYY-MM.md`에 월별로 둔다.
이 정책 문서에는 실제 기록을 추가하지 않는다. 과거 기록은 확인 가능한
증거 없이 소급 작성하지 않으며, 일상 작업에서 전체 기록을 다시 읽지 않는다.
Notion 사본은 commit 이후 push 전에 생성하며 로컬 기록을 대체하지 않는다.
