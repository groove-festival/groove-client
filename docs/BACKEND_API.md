# GROOVE Backend API Integration Notes

**Source**: supplied OpenAPI 3.1 document, `GROOVE Festival API` v0.4  
**Scope**: frontend deployment and GROOVE PLAYLIST integration planning  
**Status**: implementation reference with backend confirmation required

This document summarizes the backend API contract from the supplied OpenAPI
document and records the frontend work needed before production operation.
`docs/PRD.md` remains the product behavior source of truth.

## 1. Recommended Next Step

Keep the frontend base path as `/groove/`. Register the production API origin in
`VITE_API_BASE_URL`, enable Google Analytics through environment variables, and
confirm the API contract conflicts listed in section 7 with the backend before
removing frontend mocks.

## 2. Runtime Configuration

The supplied OpenAPI document exposes only one server URL:

```txt
http://localhost:8080/api
```

That is a local backend URL, not a production API URL. The frontend still needs
the production API base URL from the backend or infrastructure owner.

Frontend environment variables:

| Key                       | Production value                | Notes                                       |
| ------------------------- | ------------------------------- | ------------------------------------------- |
| `VITE_API_BASE_URL`       | Backend production API base URL | Example shape: `https://<api-host>/api`     |
| `VITE_TELEMETRY_ENABLED`  | `true`                          | Enables telemetry only in production builds |
| `VITE_GA_MEASUREMENT_ID`  | `G-RBVL7J63PJ`                  | Google Analytics measurement ID             |
| `VITE_SENTRY_DSN`         | Optional                        | Register only if Sentry is used             |
| `VITE_CLARITY_PROJECT_ID` | Optional                        | Register only if Microsoft Clarity is used  |

Local development can use:

```txt
VITE_API_BASE_URL=http://localhost:8080/api
VITE_TELEMETRY_ENABLED=false
```

## 3. Deployment and CORS

The frontend is intentionally served under `/groove/`. This path is controlled
by Vite `base` and React Router `basename`; it is not a CORS setting.

CORS is checked by origin. Ask the backend to allow these origins:

```txt
http://localhost:5173
https://groove-client.vercel.app
```

If the service later moves to the PRD domain, also allow:

```txt
https://chcse.knu.ac.kr
```

Because the frontend Axios client uses `withCredentials: true`, cookie-based
sessions require backend CORS responses to include credential support and an
exact allowed origin. The backend must not use wildcard origin with credentials.

For sub-path production at `chcse.knu.ac.kr/groove`, confirm cookie scope with
the backend:

```txt
Path=/groove
SameSite=None; Secure
```

`Path=/` is acceptable only if the team intentionally shares the session across
the full domain.

## 4. Common Response Shape

All responses are wrapped:

```json
{
  "success": true,
  "data": {},
  "error": {
    "code": "C001",
    "message": "..."
  }
}
```

Frontend API functions should unwrap `response.data.data`, not return
`response.data` directly. Error handling should read `response.data.error.code`
when the HTTP status is not enough.

Known error code groups from the spec:

| Code      | Meaning                                        |
| --------- | ---------------------------------------------- |
| `C001`    | Invalid or missing required value              |
| `C002`    | Missing idempotency key                        |
| `C003`    | Not logged in                                  |
| `C004`    | Forbidden role                                 |
| `A001`    | Invalid Google credential                      |
| `A002`    | Invalid admin login                            |
| `PLST001` | Playlist is not in submission phase            |
| `PLST002` | Song request not found                         |
| `PLST005` | External music API failure                     |
| `PLST006` | Playlist is not in published phase             |
| `PLST007` | Track was not found in previous search results |
| `PLST008` | Display order does not match selected songs    |
| `PLST009` | Song request rate limit exceeded               |

## 5. Public and Participant APIs

Base path below assumes `VITE_API_BASE_URL` already includes `/api`.

| Method | Path                           | Purpose                            | Frontend use                                                                   |
| ------ | ------------------------------ | ---------------------------------- | ------------------------------------------------------------------------------ |
| `GET`  | `/festival/status`             | Festival and playlist phase state  | Decide whether to show countdown, submission form, closed state, or final list |
| `GET`  | `/playlist/search?keyword=...` | Search music tracks                | Search UI before submitting a song                                             |
| `POST` | `/playlist/songs`              | Submit or overwrite a song request | Song request form                                                              |
| `GET`  | `/playlist/final-songs`        | Get final published playlist       | Final playlist page                                                            |
| `GET`  | `/playlist/songs`              | Get submitted song list            | Contract conflict; see section 7                                               |

### `GET /festival/status`

Returns `FestivalStatusResponse`.

Important fields:

| Field                        | Type                                                  | Notes                                 |
| ---------------------------- | ----------------------------------------------------- | ------------------------------------- |
| `phase`                      | `BEFORE \| LIVE \| AFTER`                             | Festival phase                        |
| `festivalStartAt`            | ISO datetime                                          | Festival starts                       |
| `festivalEndAt`              | ISO datetime                                          | Exclusive festival end                |
| `storyCollectionOpen`        | boolean                                               | Singing contest story collection flag |
| `playlist.phase`             | `BEFORE_OPEN \| SUBMISSION \| SELECTION \| PUBLISHED` | GROOVE PLAYLIST phase                 |
| `playlist.submissionStartAt` | ISO datetime                                          | Submission start                      |
| `playlist.submissionEndAt`   | ISO datetime                                          | Exclusive submission end              |
| `playlist.publishAt`         | ISO datetime                                          | Final playlist publish time           |

### `GET /playlist/search`

Query:

| Name      | Type   | Required |
| --------- | ------ | -------- |
| `keyword` | string | yes      |

Returns:

```ts
interface SongSearchResponse {
  tracks: SongTrackResponse[];
}

interface SongTrackResponse {
  trackId: string;
  title: string;
  artist: string;
  albumCoverUrl?: string;
}
```

Frontend behavior:

- Show empty state when `tracks` is empty.
- Show default album art when `albumCoverUrl` is missing.
- Disable submission until the user selects a returned `trackId`.
- Treat `502 / PLST005` as external music search failure.

### `POST /playlist/songs`

Header:

| Name              | Type          | Required | Notes                                       |
| ----------------- | ------------- | -------- | ------------------------------------------- |
| `Idempotency-Key` | UUIDv4 string | yes      | Generate on the frontend per submit attempt |

Request body:

```ts
interface SongRequestSubmitRequest {
  studentNumber: string;
  name: string;
  trackId: string;
  college: "IT" | "NURSING" | "ART" | "SOCIAL" | "EDU" | "NATURE";
  department: string;
  nickname: string;
}
```

Returns `MySongResponse`:

```ts
interface MySongResponse {
  songRequestId: number;
  trackId: string;
  title: string;
  artist: string;
  albumCoverUrl?: string;
  college: "IT" | "NURSING" | "ART" | "SOCIAL" | "EDU" | "NATURE";
  department: string;
  nickname: string;
  requestedAt: string;
  updatedAt: string;
}
```

Backend behavior from the spec:

- Same `studentNumber` overwrites the previous request.
- Duplicate tracks from different students are allowed.
- The submitted `trackId` must come from a previous search result.
- Submission is accepted only during `SUBMISSION` phase.

### `GET /playlist/final-songs`

Returns `SongListResponse`:

```ts
interface SongListResponse {
  totalCount: number;
  songs: PublicSongResponse[];
}

interface PublicSongResponse {
  albumCoverUrl?: string;
  title: string;
  artist: string;
  nickname: string;
  college: "IT" | "NURSING" | "ART" | "SOCIAL" | "EDU" | "NATURE";
  updatedAt: string;
}
```

Frontend behavior:

- Show this only in `PUBLISHED` phase.
- Treat `403 / PLST006` as "final playlist is not public yet."
- Preserve backend order as the public display order.

## 6. Auth and Promo Admin APIs

These are in the supplied backend spec but are not currently implemented in the
frontend screens.

| Method   | Path                                     | Purpose                              |
| -------- | ---------------------------------------- | ------------------------------------ |
| `POST`   | `/auth/google`                           | Google OAuth login                   |
| `POST`   | `/auth/admin/login`                      | Admin ID/password login              |
| `POST`   | `/auth/logout`                           | Logout                               |
| `GET`    | `/auth/me`                               | Current login state and role         |
| `GET`    | `/admin/promo/songs`                     | Promo admin song request list        |
| `DELETE` | `/admin/promo/songs/{song-id}`           | Delete a song request                |
| `PATCH`  | `/admin/promo/songs/{song-id}/selection` | Toggle final selection               |
| `PUT`    | `/admin/promo/songs/display-order`       | Replace full public display order    |
| `PUT`    | `/admin/promo/playlist-phase`            | Set or clear playlist phase override |

Admin roles from the spec:

```ts
type AdminRole = "USER" | "PUB_ADMIN" | "STAGE_ADMIN" | "PLAN_ADMIN" | "PROMO_ADMIN";
```

Promo admin list includes private fields:

```ts
interface AdminSongRequestResponse {
  songRequestId: number;
  title: string;
  artist: string;
  albumCoverUrl?: string;
  trackId: string;
  nickname: string;
  name: string;
  studentNumber: string;
  college: "IT" | "NURSING" | "ART" | "SOCIAL" | "EDU" | "NATURE";
  department: string;
  selected: boolean;
  displayOrder?: number;
  requestedAt: string;
  updatedAt: string;
}
```

These fields include personal data. Do not send them to Google Analytics,
Sentry, Clarity, logs, screenshots, or user-visible public pages.

## 7. Contract Conflicts to Confirm

These points conflict with the current PRD or current frontend implementation.
Resolve them before live integration.

| Topic                               | OpenAPI v0.4 says                                                                      | PRD/current frontend says                                                          | Needed decision                                                                       |
| ----------------------------------- | -------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| Production API URL                  | Only `http://localhost:8080/api` is listed                                             | Vercel production needs an external API URL                                        | Backend must provide production `VITE_API_BASE_URL`                                   |
| Participant submitted list          | `GET /playlist/songs` returns submitted songs during submission phase                  | PRD says other participants' submitted songs must not be exposed during submission | Remove/lock down endpoint or clarify who may call it                                  |
| Song request auth                   | `POST /playlist/songs` body includes `studentNumber`; endpoint notes say no login flow | PRD says "학번 로그인" and `StudentSession` exists in data model                   | Decide whether student session exists or form-only student number is the final policy |
| Nickname and college in public list | `PublicSongResponse` includes `nickname` and `college`                                 | PRD marks requester display as open issue §11-14                                   | Confirm whether final playlist shows requester info                                   |
| Music provider                      | Schema descriptions mention iTunes track IDs                                           | PRD and frontend text mention YouTube Music                                        | Confirm provider naming and user-facing copy                                          |
| Required fields                     | Schema marks only `college` as required                                                | Endpoint description says missing required values return `C001`                    | Backend should mark all required fields in OpenAPI or explain nullable behavior       |
| Submit endpoint                     | `POST /playlist/songs`                                                                 | Current frontend mock fallback points to `/song-requests`                          | Frontend must change endpoint when integrating                                        |
| Final playlist endpoint             | `GET /playlist/final-songs`                                                            | Current frontend fallback points to `/playlist`                                    | Frontend must change endpoint when integrating                                        |
| Response envelope                   | All responses use `{ success, data, error }`                                           | Current frontend functions return raw `response.data` as if data were unwrapped    | Frontend must add response unwrapping                                                 |
| Overwrite handling                  | Same student number overwrites automatically with `200`                                | Current mock throws conflict and asks for overwrite confirmation                   | Confirm if frontend confirmation should remain before submitting                      |

## 8. Frontend Implementation Checklist

Do these after the contract conflicts are resolved.

1. Set production environment variables in Vercel and redeploy.
2. Keep `/groove/` base path unless the hosting target changes away from a
   sub-path deployment.
3. Add a shared API response envelope type and unwrap helper.
4. Replace playlist mocks with real API calls:
   - `GET /festival/status`
   - `GET /playlist/search`
   - `POST /playlist/songs`
   - `GET /playlist/final-songs`
5. Generate `Idempotency-Key` for song request submission.
6. Map frontend college labels to backend enum values:

   | UI label | API value |
   | -------- | --------- |
   | `IT`     | `IT`      |
   | `간호`   | `NURSING` |
   | `예술`   | `ART`     |
   | `사회`   | `SOCIAL`  |
   | `사범`   | `EDU`     |
   | `자연`   | `NATURE`  |

7. Replace free-text song input with search result selection by `trackId`.
8. Update final playlist mapping from backend fields:
   - `songRequestId` or stable backend ID to frontend `id`
   - `title` to current `song`
   - `albumCoverUrl` to current `thumbnailUrl`
9. Add phase-aware UI behavior from `GET /festival/status`.
10. Confirm GA page-view collection after production deploy.

## 9. Backend Message Template

```txt
프론트 운영 연동 전에 아래 확인 부탁드립니다.

1. Production API base URL을 알려주세요.
   프론트 Vercel Production에는 VITE_API_BASE_URL=<운영 API URL>로 등록합니다.

2. CORS 허용 origin에 아래를 등록 부탁드립니다.
   - https://groove-client.vercel.app
   - http://localhost:5173
   추후 학부 도메인 전환 시 https://chcse.knu.ac.kr 도 추가 필요합니다.

3. withCredentials 쿠키 세션을 사용할 예정이면
   Access-Control-Allow-Credentials 설정과 쿠키 Path/SameSite/Secure 정책 확인 부탁드립니다.

4. OpenAPI v0.4에서 아래 항목이 PRD/프론트와 충돌합니다.
   - GET /playlist/songs가 참여자용 신청 목록을 노출하는지
   - 학번 로그인 세션이 있는지, 아니면 studentNumber 폼 제출만 하는지
   - 최종 공개 목록에 nickname/college를 노출할지
   - trackId가 iTunes 기준인지 YouTube Music 기준인지
   - SongRequestSubmitRequest의 required 필드가 college만 맞는지
```
