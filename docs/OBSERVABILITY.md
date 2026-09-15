# 사용자 관측 운영 가이드

GROOVE PLAYLIST의 사용자 행동, 신청 성공률, 프론트엔드 오류를 개인정보 없이
관측하기 위한 계약과 운영 절차를 정의한다. 실제 수집은 production build에서
`VITE_TELEMETRY_ENABLED=true`이고 각 서비스 식별자가 있을 때만 활성화한다.

## 도구별 책임

| 도구              | 책임                                                      |
| ----------------- | --------------------------------------------------------- |
| Google Analytics  | 신청 퍼널, 완료율, 브라우저·기기별 집계                   |
| Microsoft Clarity | Rage Click, Dead Click, 히트맵, 실패 세션의 마스킹된 녹화 |
| Sentry            | JavaScript 오류, 영향 세션, 안전한 직전 행동 breadcrumb   |

Clarity와 Sentry Replay를 동시에 사용하지 않는다. 세션 행동은 Clarity, 오류
원인은 Sentry로 나눠 녹화 중복과 개인정보 노출 면적을 줄인다.

## 개인정보 경계

학번, 이름, 학과, 닉네임, 검색어, 곡명, 아티스트, trackId, 폼 값, API
요청·응답 본문을 이벤트나 breadcrumb로 보내지 않는다. 오류는 전체 메시지가 아닌
`PLST005`처럼 정규화된 코드만 전송한다. 시간과 검색 결과 수도 원시 값 대신
구간으로 전송한다.

관리자 직접 진입 시 Clarity를 초기화하지 않는다. 공개 화면에서 SPA로 관리자
화면에 이동하는 예외와 향후 초기화 변경에 대비해 관리자 루트 DOM도 명시적으로
마스킹한다. 신청 폼의 입력값은 Clarity 기본 마스킹 대상이며, 검색 결과·선택한
곡·완료 모달처럼 DOM에 다시 표시되는 곡 정보도 명시적으로 마스킹한다.

실제 수집을 활성화하기 전에 서비스 담당자가 다음을 확인해야 한다.

1. 이용자 동의와 개인정보처리방침에 분석·세션 녹화 목적이 포함되는지
2. Clarity 프로젝트의 마스킹 모드와 보존 기간
3. GA와 Sentry의 데이터 보존 기간과 접근 권한
4. 운영 계정에 최소 인원만 접근하는지

## 이벤트 계약

| 이벤트                             | 시점                   | 파라미터                                 |
| ---------------------------------- | ---------------------- | ---------------------------------------- |
| `playlist_view`                    | 플레이리스트 단계 확인 | `phase`                                  |
| `playlist_form_view`               | 신청 폼 노출           | 없음                                     |
| `playlist_form_start`              | 첫 폼 변경             | 없음                                     |
| `song_search_attempt`              | 유효한 검색 시작       | 없음                                     |
| `song_search_success`              | 한 개 이상 검색 성공   | `duration_bucket`, `result_count_bucket` |
| `song_search_empty`                | 검색 결과 없음         | `duration_bucket`                        |
| `song_search_failure`              | 검색 요청 실패         | `duration_bucket`, `error_code`          |
| `song_select`                      | 검색 결과 선택         | 없음                                     |
| `playlist_form_validation_failure` | 제출 전 검증 실패      | `validation_field`                       |
| `song_submit_attempt`              | 신청 요청 시작         | 없음                                     |
| `song_submit_success`              | 신청 요청 성공         | `duration_bucket`                        |
| `song_submit_failure`              | 신청 요청 실패         | `duration_bucket`, `error_code`          |

GA에는 이벤트와 파라미터를 보내고, Clarity에는 동일한 이벤트 이름을 Smart
Event로 보낸다. Sentry가 초기화된 경우 동일한 안전한 데이터가 breadcrumb로
남는다.

## 대시보드 설정

GA에서 다음 퍼널을 만들고 `song_submit_success`를 Key Event로 지정한다.

```text
playlist_view → playlist_form_start → song_select → song_submit_attempt → song_submit_success
```

`phase`, `error_code`, `duration_bucket`, `result_count_bucket`,
`validation_field`를 Custom Dimension으로 등록한다. 브라우저, 운영체제, 기기
유형은 도구가 자동으로 수집하는 기본 dimension을 사용한다.

Clarity에서는 다음 세그먼트를 저장한다.

- `song_submit_failure` + Rage Click + 모바일
- `song_search_empty` 또는 `song_search_failure` + 브라우저별 필터
- Dead Click + Safari 또는 iOS

## 배포 전 확인

1. production build의 Network 패널에서 GA, Clarity, Sentry 요청을 확인한다.
2. 요청 payload에 개인정보와 원본 폼 값이 없는지 직접 확인한다.
3. GA Realtime·DebugView에서 이벤트와 파라미터를 확인한다.
4. Clarity에서 마스킹된 신청 세션과 Smart Event를 확인한다.
5. Sentry에서 production 환경과 안전한 breadcrumb를 확인한다.

Clarity 설정과 Smart Event 반영에는 시간이 걸릴 수 있다. 신청 접수를 시작하기
전에 설정하고, 배포 직후 별도의 테스트 데이터로 확인한다.

## Sentry 릴리스와 소스맵

운영 빌드에서 압축된 오류를 원본 TypeScript 위치로 복원하려면 CI에 다음
build-only 환경변수를 설정한다.

```env
SENTRY_AUTH_TOKEN=
SENTRY_ORG=
SENTRY_PROJECT=
# Vercel 또는 GitHub Actions 밖에서 빌드할 때만 직접 지정
SENTRY_RELEASE=
```

Vercel에서는 `VERCEL_GIT_COMMIT_SHA`, GitHub Actions에서는 `GITHUB_SHA`를 release로
자동 사용한다. 다른 환경의 `SENTRY_RELEASE`는 Git commit SHA나 배포 ID처럼
배포마다 바뀌는 값을 사용한다. Vite 설정이 같은 값을 클라이언트 Sentry SDK에도
주입하므로 오류와 업로드된 소스맵의 release가 일치한다. 업로드 토큰·조직·프로젝트와
release가 모두 있을 때만 hidden source map을 만들고 Sentry에 업로드하며, 업로드
후 `dist`의 map 파일은 삭제한다.

`SENTRY_AUTH_TOKEN`은 빌드 서버에서만 읽는 비밀값이다. `VITE_` 접두사를 붙이거나
저장소, 브라우저 환경, 배포 결과물에 포함하지 않는다. 반면
`VITE_SENTRY_DSN`은 브라우저 SDK가 오류를 보낼 Sentry 프로젝트 DSN이다.
