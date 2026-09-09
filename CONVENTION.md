# Frontend Project Convention

이 문서는 `groove-client`에서 사람과 AI Agent가 함께 따르는 프론트엔드 작업
규칙이다. 저장소의 실제 코드·설정·명령을 기준으로 하며, 상세 FSD 기준은
[`docs/FSD_ARCHITECTURE.md`](docs/FSD_ARCHITECTURE.md)를 단일 기준으로 사용한다.

기본 선택은 **이름으로 책임을 드러내고, 변경 이유가 같은 코드를 가까이 두며,
자동화할 수 있는 규칙은 도구로 검사하는 것**이다. 외부 스타일 가이드는 판단
근거로 사용하되 저장소의 FSD 경계와 실제 도구 구성을 우선한다.

## 목차

1. 기본 원칙
2. 기술 기준
3. Feature-Sliced Design
4. TypeScript와 공통 네이밍
5. React 컴포넌트
6. API와 서버 상태
7. 폼과 Zod
8. 환경과 관측 데이터
9. 테스트와 완료 검증
10. Git과 커밋 메시지
11. 문서와 협업
12. 자동 검사와 사람 검토
13. 종료 체크리스트
14. 참고 자료

## 1. 기본 원칙

- 작업 전에 해결할 문제, 범위, 비목표, 완료 기준을 확인한다.
- 관련 코드·테스트·문서를 먼저 읽고 기존 변경을 보존한다.
- 요청 범위를 벗어난 리팩터링, 파일 이동, 의존성 추가, 구조 변경은 하지
  않는다.
- 실행한 검증만 기록하고 실패, 미실행, 수동 확인 필요를 구분한다.
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

## 4. TypeScript와 공통 네이밍

- 불가피한 경계가 아니면 `any` 대신 `unknown`과 명시적 narrowing을 사용한다.
- 객체 형태의 계약은 `interface`, union·tuple·primitive alias·mapped type·
  conditional type·`z.infer` 결과는 `type`을 사용한다.
- 타입과 interface는 `PascalCase`, 함수·변수·Hook은 `camelCase`를 사용한다.
- Boolean은 가능한 경우 `is`, `has`, `can`, `should`처럼 의미가 드러나는
  접두사를 사용한다.
- 전역적으로 불변인 원시 상수만 `UPPER_SNAKE_CASE`를 사용한다. 객체나 함수는
  `const`라는 이유만으로 대문자로 만들지 않는다.
- export한 함수는 호출부가 반환 타입에 의존하거나 public API 계약이 되는
  경우 반환 타입을 명시한다. 지역 콜백처럼 추론이 더 명확한 경우는 생략한다.
- 타입으로만 사용하는 import는 `import type` 또는 inline `type` import를
  사용한다.

파일과 디렉터리 이름은 다음을 기본으로 한다.

| 대상                            | 형식                 | 예시                             |
| ------------------------------- | -------------------- | -------------------------------- |
| React 컴포넌트 파일·디렉터리    | `PascalCase`         | `SongCard/SongCard.tsx`          |
| Hook·함수·API operation 파일    | `camelCase`          | `useSongSearch.ts`               |
| 테스트 파일                     | 원본명 + 역할 접미사 | `SongCard.test.tsx`              |
| FSD slice·목적별 asset 디렉터리 | `kebab-case`         | `song-request`                   |
| 정적 asset                      | `kebab-case`         | `hero-illustration.png`          |
| FSD public API                  | `index.ts`           | `features/song-request/index.ts` |

## 5. React 컴포넌트

### 선언과 export

- 컴포넌트 이름과 파일 이름은 `PascalCase`로 일치시킨다.
- 일반 컴포넌트는 named arrow function으로 선언한다.
- page 컴포넌트만 이름 있는 `export default function`으로 선언한다. 익명 default
  export는 사용하지 않는다.
- page slice의 `index.ts`는 대표 page를 default로 다시 내보낸다. 따라서
  `lazy(() => import("@/pages/home"))`처럼 slice public API를 지키면서 지연
  로딩할 수 있다.
- `React.FC`와 `React.FunctionComponent`는 사용하지 않는다. 구조 분해한 props
  매개변수에 타입을 직접 지정한다.
- page 이외의 모듈은 named export를 사용한다. FSD 경계를 넘는 export는 해당
  slice 또는 sliceless segment의 public API에서만 노출한다.

```tsx
export interface SongCardProps {
  artist: string;
  title: string;
}

export const SongCard = ({ artist, title }: SongCardProps) => {
  return (
    <article>
      <h2>{title}</h2>
      <p>{artist}</p>
    </article>
  );
};
```

```tsx
export default function SongRequestPage() {
  return <main>노래 신청</main>;
}
```

### Props와 컴포넌트 디렉터리

- Props 객체는 `interface <ComponentName>Props`로 선언한다. 컴포넌트 모듈
  밖에서 타입이 필요하면 export하고, slice 밖에서 필요하면 slice public API에
  명시적으로 추가한다.
- props가 없으면 빈 Props interface나 빈 구조 분해 매개변수를 만들지 않는다.
- 독립적으로 export되는 재사용 UI 컴포넌트는 전용 디렉터리를 사용한다.
  `index.ts`에는 재노출만 두고 구현 코드를 넣지 않는다.
- 부모에서만 쓰이는 작은 하위 컴포넌트는 부모 파일 또는 부모 디렉터리에 함께
  둘 수 있다. `NavTop`, `NavTopItem`, `NavTopMenu`처럼 함께 변경되는 컴포넌트는
  같은 디렉터리에 두어 응집도를 유지한다.
- sliced layer에 `ui/index.ts` 같은 중간 barrel을 만들지 않는다. slice
  `index.ts`가 외부 public API이고, 컴포넌트 디렉터리의 `index.ts`는 그
  컴포넌트의 지역 진입점일 뿐이다.

```text
ui/
└─ SongCard/
   ├─ index.ts
   ├─ SongCard.tsx
   └─ SongCard.test.tsx
```

### 컴포넌트 책임

- 파생 가능한 값을 state에 중복 저장하지 않는다. 이벤트에서 계산할 수 있는
  일은 Effect로 옮기지 않는다.
- 사용자 흐름에 관련 있는 loading, empty, error 상태와 경계 조건을 함께
  설계한다.
- 사용자에게 보이는 문구는 현재 제품 언어인 한국어를 기본으로 하며 같은
  개념에는 같은 용어를 사용한다.
- widget layer라는 이유만으로 컴포넌트 이름에 `Widget`을 붙이지 않는다.
  `widgets/festival-header`처럼 경로가 아키텍처 역할을 나타내므로 컴포넌트는
  `FestivalHeader`처럼 제품 개념으로 이름 짓는다.

### 모바일 앱 프레임과 Figma 캔버스

- 앱 전체의 600px 모바일 프레임은 `AppComposition`의 전역 shell이 담당한다.
  route 화면 안에서 별도의 page frame이나 중첩된 `max-w-[600px]` wrapper를
  다시 만들지 않는다.
- Figma 원본 프레임이 393px 기준이면 route의 원본 캔버스 루트에
  `.figma-mobile-canvas`를 적용한다. 절대 좌표, 이미지, 장식 요소는 393px
  좌표계를 유지하고 CSS가 600px 앱 프레임까지 비율 확대하게 둔다.
- 393px Figma 화면을 구현할 때 좌표와 asset 크기를 600px 기준으로 수동 변환하지
  않는다. 다른 기준 폭의 프레임이면 원본 폭을 기록하고 화면 slice 안에서 좁게
  보정한다.
- 상단 고정 네비게이션은 확대 캔버스 안에 넣지 않는다. 전역 앱 프레임 폭에
  맞춰 `w-full max-w-[600px]` 기준으로 배치하고, 본문에는 64px spacer를 둔다.

## 6. API와 서버 상태

### 배치와 endpoint 선언

- 공통 Axios instance와 전송 설정은 `shared/api`에 둔다.
- 업무 endpoint는 사용하는 slice의 `api` segment에 둔다. `service`라는
  별도 segment는 만들지 않는다.
- endpoint마다 `camelCase` operation 파일을 만들고, 요청·응답 타입, 요청
  함수, TanStack Query option 또는 Hook처럼 API 명세와 함께 변경되는 코드를
  같은 파일에 둔다. 파일이 여러 endpoint나 독립 책임을 갖기 시작하면 나눈다.
- HTTP body가 있는 계약은 `<OperationName>RequestBody`와
  `<OperationName>ResponseBody` interface로 이름 짓는다. path·query parameter는
  각각 `<OperationName>PathParams`, `<OperationName>SearchParams`로 구분하며,
  body가 없으면 빈 `RequestBody`를 만들지 않는다.
- 요청 함수는 `export async function`으로 선언한다. 이름은 `get`, `create`,
  `update`, `delete`, `search`, `signUp`처럼 실제 동작으로 시작하고, 조회 기준이
  의미 있을 때만 `ById`, `BySlug` 등을 붙인다.
- transport envelope를 사용한다면 요청 함수에서 실제 application data까지
  일관되게 풀어 반환한다. 존재하지 않는 `BaseResponse` 계약을 예시만 보고
  새로 만들지 않는다.

```ts
export interface CreateProfileRequestBody {
  name: string;
}

export interface CreateProfileResponseBody {
  id: number;
  name: string;
}

export async function createProfile(
  requestBody: CreateProfileRequestBody,
): Promise<CreateProfileResponseBody> {
  const { data } = await httpClient.post<CreateProfileResponseBody>(
    "/profiles",
    requestBody,
  );

  return data;
}

export const useCreateProfile = () => {
  return useMutation({ mutationFn: createProfile });
};
```

### Query Key

- Query Key는 HTTP 호출 이름이 아니라 캐시에 저장되는 **데이터의 정체성과
  계층**을 표현한다. `GET_PROFILE_BY_ID` 같은 대문자 동작명은 사용하지 않는다.
- 각 slice의 `api/queryKeys.ts`에 `<domain>QueryKeys` 객체로 모은다. key factory는
  호출 형식을 통일하기 위해 인자가 없어도 함수로 선언하고 모든 tuple에
  `as const`를 사용한다.
- query function 결과를 바꾸는 id, filter, page 등의 직렬화 가능한 의존성은
  반드시 Query Key에 포함한다.
- 상위 key를 재사용해 전체, 목록, 상세를 계층화하고 무효화 범위를 예측
  가능하게 유지한다.

```ts
export const profileQueryKeys = {
  all: () => ["profile"] as const,
  lists: () => [...profileQueryKeys.all(), "list"] as const,
  list: (filters: ProfileSearchParams) =>
    [...profileQueryKeys.lists(), filters] as const,
  details: () => [...profileQueryKeys.all(), "detail"] as const,
  detail: (profileId: number) => [...profileQueryKeys.details(), profileId] as const,
};
```

## 7. 폼과 Zod

- React Hook Form 상태와 Zod schema는 해당 폼을 소유한 page 또는 feature에
  최대한 가깝게 둔다. 여러 slice가 실제로 공유하는 기반만 아래 레이어로
  이동한다.
- Zod schema 값은 `camelCase`와 `Schema` 접미사를 사용한다.
- `z.infer`로 만든 타입은 `PascalCase`와 `SchemaType` 접미사를 사용한다. API
  DTO와 폼 입력 타입이 다른 경우 둘을 같은 타입으로 억지로 합치지 않는다.
- 사용자 입력과 외부 응답은 신뢰 경계에서 parse하며 검증 실패가 사용자에게
  미치는 error 상태를 함께 처리한다.

```ts
export const signUpSchema = z.object({
  name: z.string().min(1),
});

export type SignUpSchemaType = z.infer<typeof signUpSchema>;
```

## 8. 환경과 관측 데이터

- 로컬 설정은 `.env.local`에 두고 커밋하지 않는다. 공유 가능한 키 이름과
  안전한 예시는 `.env.example`에만 둔다.
- GA·Sentry·Clarity에는 학번, 이름, 입금자명, 폼 값, 테이블 코드 같은
  민감하거나 식별 가능한 값을 이벤트, 오류, breadcrumb로 전송하지 않는다.
- 관측 도구는 저장소의 기존 opt-in 조건을 유지한다. 실제 수집을 활성화할
  때는 동의, 마스킹, 보존 기간을 별도로 확인한다.

## 9. 테스트와 완료 검증

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

### Figma 기반 화면 검증

- 정적 디자인 기준은 정확한 Figma 프레임·컴포넌트 node이고, Prototype은
  클릭과 상태 전이의 기준으로 사용한다. Prototype viewer의 확대·축소 화면을
  정적 pixel 기준으로 사용하지 않는다.
- 실제 React 화면을 고정된 viewport, DPR, 브라우저, 폰트, locale, theme,
  데이터 상태에서 캡처해 원본 export와 비교한다.
- pixel 차이뿐 아니라 주요 요소의 좌표·크기, token, text, asset, component
  대응과 Prototype 흐름을 함께 확인한다.
- 오차를 가리는 임계값 확대, mask, 테스트 skip으로 통과시키지 않는다.
  `project-figma-visual-parity`의 정지 조건과 증거 형식을 따른다.
- diff가 0인 고정 환경만 `pixel 동일`로 표현한다. 합의된 임계값 안이면
  `허용 오차 이내`, 기준이나 환경이 없으면 `수동 확인 필요` 또는 `미실행`으로
  남긴다.

## 10. Git과 커밋 메시지

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
않는 메시지를 거부한다. 별도 hook 패키지는 사용하지 않는다.

팀원은 checkout마다 자신의 Notion 하위 페이지를 설정한다.

```sh
pnpm notion:setup -- "<내 Notion 하위 페이지 URL>"
```

커밋과 push가 승인되면 최종 계획 commit을 만든 뒤, 대화와 변경 내용을
Notion에 한 건으로 문서화하고 다시 읽어 확인한다. 확인한 문서 URL을 아래
명령으로 현재 commit에 연결한다.

```sh
pnpm notion:mark -- "<Notion 문서 URL>"
```

`post-commit`은 새 commit을 문서화 대기 상태로 표시하고, `pre-push`는 확인된
문서가 연결되지 않은 commit을 거부한다. 여러 계획 commit이 한 번의 push에
포함되면 하나의 Notion 문서로 묶고 포함된 commit hash를 모두 적는다. MCP
장애나 긴급한 예외로 guard를 우회해야 할 때만 아래 one-shot 명령을 사용한다.

```sh
git -c aiworklog.skip=true push
```

이 Notion 문서 외에 프로젝트 안에 별도 AI 활동 기록 파일을 만들지 않는다.
사용자가 commit 없이 대화 문서화만 명시적으로 요청한 경우에는 Notion 문서를
작성·재조회하되 `notion:mark`를 실행하지 않는다.

관련 없는 변경을 한 커밋에 섞거나 비밀정보·개인 설정을 커밋하지 않는다. AI
Agent는 사용자가 명시적으로 요청하고 커밋 계획을 승인하기 전에는 staging이나
commit을 실행하지 않는다.

## 11. 문서와 협업

- Issue는 `.github/ISSUE_TEMPLATE/`의 `디자인`, `리팩토링`, `버그 신고`, `기능 작업`,
  `문서 작업` Form 중 목적에 맞는 항목을 사용한다.
- PR은 `.github/pull_request_template.md`의 관련 이슈, 작업 내용, 작업 방식의
  이유와 실제 검증을 간결하게 작성한다.
- 제품 동작과 사용자 흐름은 `docs/PRD.md`, 구조는
  `docs/FSD_ARCHITECTURE.md`에서 관리한다.
- 실제 Issue, PR, Discussion이 없으면 링크를 만들지 않는다.
- 존재하지 않는 회의, 결정, 기여, 검토, 승인, 테스트 결과를 만들지 않는다.
- 완료 보고에는 변경 파일, 실행한 검증과 결과, 실패·미실행, 남은 위험,
  보존한 기존 변경, 수행하지 않은 commit·push·deploy를 적는다.

## 12. 자동 검사와 사람 검토

규칙은 강제 가능성과 의미 판단 필요 여부를 구분한다.

| 범위                                           | 검사 수단                       |
| ---------------------------------------------- | ------------------------------- |
| 공백, 따옴표, 줄바꿈, Tailwind class 정렬      | Prettier                        |
| object type의 interface 사용, type-only import | ESLint                          |
| `React.FC` 금지, page 외 default export 금지   | ESLint                          |
| Hook 규칙과 Fast Refresh export 안전성         | ESLint                          |
| FSD 레이어, slice, public API, import 방향     | Steiger `pnpm check:fsd`        |
| 타입 계약                                      | TypeScript `pnpm typecheck`     |
| 이름의 업무 의미, 컴포넌트 분리, API 응집도    | 작성자 자체 확인과 PR 검토      |
| 사용자 동작, 접근성, loading·empty·error 상태  | 관련 테스트와 필요 시 수동 확인 |

ESLint 통과만으로 이름과 책임이 적절하다고 판단하지 않는다. 새 코드가 이 문서의
예외를 필요로 하면 inline disable로 숨기기 전에 이유와 범위를 PR에 적고, 반복될
규칙이면 이 문서와 설정을 함께 변경한다.

## 13. 종료 체크리스트

- 요청 범위와 완료 기준을 충족했는가?
- FSD 레이어, slice, segment, public API와 import 방향이 맞는가?
- `pnpm check:fsd`를 마지막 변경 뒤 실행했는가?
- 관련 타입, 테스트, error/loading/empty 상태를 확인했는가?
- 위험에 비해 과도한 fast/full gate를 자동 실행하지 않았는가?
- PRD, 환경 예시, FSD 문서 등 변경된 계약을 동기화했는가?
- 실패, 미실행, 수동 확인 필요, 남은 위험을 사실대로 남겼는가?

## 14. 참고 자료

공식 문서는 라이브러리 계약의 근거이고, 대표 저장소는 패턴을 비교하기 위한
사례다. 저장소 규칙은 아래 내용을 그대로 복사한 것이 아니라 현재 FSD 구조와
도구에 맞춰 선택한 결과다.

### 공식 문서

- [React: Importing and Exporting Components](https://react.dev/learn/importing-and-exporting-components) — 이름 있는 컴포넌트와 default/named export의 차이
- [React: `lazy`](https://react.dev/reference/react/lazy) — 동적 import 모듈의 default export 요구사항
- [TypeScript Handbook: Everyday Types](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html) — interface와 type alias의 역할 차이
- [typescript-eslint: `consistent-type-definitions`](https://typescript-eslint.io/rules/consistent-type-definitions/) — object type 표기 일관성 자동 검사
- [TanStack Query: Query Keys](https://tanstack.com/query/latest/docs/framework/react/guides/query-keys) — 배열 key, 직렬화, 의존성 포함 원칙
- [Feature-Sliced Design: Slices and segments](https://feature-sliced.design/docs/reference/slices-segments) — `ui`, `api`, `model`, `lib`, `config` segment 책임
- [Feature-Sliced Design: Public API](https://feature-sliced.design/docs/reference/public-api) — slice public API와 과도한 barrel의 위험
- [Testing Library: Guiding Principles](https://testing-library.com/docs/) — 구현 세부보다 사용자 관점의 테스트

### 대표 저장소와 스타일 가이드

- [Airbnb React/JSX Style Guide](https://github.com/airbnb/javascript/blob/master/react/README.md) — 컴포넌트·파일의 PascalCase와 파일 단위 응집도 비교 근거
- [Bulletproof React: API Layer](https://github.com/alan2207/bulletproof-react/blob/master/docs/api-layer.md) — endpoint 타입, fetcher, query Hook을 operation 단위로 함께 관리하는 사례
