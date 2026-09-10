# Deployment Workflow

**Scope**: GitHub branch strategy, CI, and Vercel production deployment  
**Recommended default**: GitHub Actions runs CI; Vercel Git integration handles
preview and production deployment.

## 1. Branch Strategy

Use `dev` as the integration branch and `main` as the production branch.

```txt
dev -> feature branch -> pull request to dev -> merge to dev
dev accumulates tested changes
dev -> pull request to main -> merge to main -> production deployment
```

Branch responsibilities:

| Branch           | Purpose                                           | Deployment behavior          |
| ---------------- | ------------------------------------------------- | ---------------------------- |
| `dev`            | Integration branch for accumulated work           | Vercel Preview deployment    |
| `main`           | Production-ready branch                           | Vercel Production deployment |
| feature branches | Individual feature, fix, or chore work from `dev` | Vercel Preview deployment    |

## 2. CI

GitHub Actions workflow:

```txt
.github/workflows/ci.yml
```

Triggers:

| Event          | Branches      | Purpose                        |
| -------------- | ------------- | ------------------------------ |
| `pull_request` | `dev`, `main` | Block merging broken changes   |
| `push`         | `dev`, `main` | Verify the merged branch state |

Checks:

```txt
pnpm install --frozen-lockfile
pnpm check:fast
pnpm build
```

`pnpm check:fast` includes format check, lint, typecheck, unit/component tests,
and FSD structure checks.

## 3. CD With Vercel

Do not add a separate GitHub Actions Vercel deploy job while Vercel Git
integration is enabled. Otherwise one merge can create duplicate deployments.

Set Vercel to deploy `main` as production:

```txt
Vercel -> Project -> Settings -> Environments -> Production -> Branch Tracking
Production branch: main
```

Expected behavior:

| Git action                    | Vercel result                |
| ----------------------------- | ---------------------------- |
| Push to feature branch        | Preview deployment           |
| Merge feature branch to `dev` | Preview deployment for `dev` |
| Merge `dev` to `main`         | Production deployment        |

## 4. Vercel Project Settings

Confirm these settings in the Vercel dashboard.

Build settings:

| Setting          | Value                            |
| ---------------- | -------------------------------- |
| Framework Preset | Vite                             |
| Install Command  | `pnpm install --frozen-lockfile` |
| Build Command    | `pnpm build`                     |
| Output Directory | `dist`                           |

Production environment variables:

```txt
VITE_API_BASE_URL=https://chcse.knu.ac.kr/groove/api
VITE_TELEMETRY_ENABLED=true
VITE_GA_MEASUREMENT_ID=G-RBVL7J63PJ
```

Preview environment variables can use the same API URL for live staging, or a
separate staging backend if one exists.

## 5. GitHub Protection Settings

Configure this in GitHub repository settings.

```txt
GitHub -> Repository -> Settings -> Branches -> Branch protection rules
```

Recommended rules:

| Branch | Required rule                        |
| ------ | ------------------------------------ |
| `dev`  | Require pull request before merging  |
| `dev`  | Require status check: `Quality Gate` |
| `main` | Require pull request before merging  |
| `main` | Require status check: `Quality Gate` |
| `main` | Restrict direct pushes               |

If the team releases by PR from `dev` to `main`, keep `main` protected and make
the `dev -> main` PR the release approval point.

## 6. Release Procedure

1. Start work from `dev`.
2. Create a feature branch.
3. Open a pull request into `dev`.
4. Wait for GitHub Actions CI to pass.
5. Merge into `dev`.
6. When accumulated changes are ready, open a pull request from `dev` to `main`.
7. Wait for GitHub Actions CI to pass again.
8. Merge into `main`.
9. Confirm Vercel creates a Production deployment.
10. Verify the production site and integrations.

Production verification:

```txt
https://groove-client.vercel.app/groove/
https://chcse.knu.ac.kr/groove/
https://chcse.knu.ac.kr/groove/api/festival/status
```

Browser checks:

```txt
No console CORS error
Network request to /groove/api/... succeeds
Network request to gtag/js?id=G-RBVL7J63PJ succeeds
GA real-time report receives page_view
```

## 7. When to Use GitHub Actions CD Instead

Use a GitHub Actions Vercel deployment workflow only if the team intentionally
turns off Vercel's automatic Git deployments or needs custom deployment gates.
That setup requires GitHub secrets such as:

```txt
VERCEL_TOKEN
VERCEL_ORG_ID
VERCEL_PROJECT_ID
```

Until that is needed, keep deployment ownership in Vercel and quality ownership
in GitHub Actions.
