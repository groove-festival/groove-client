# syntax=docker/dockerfile:1.4

# 1단계: Node로 빌드
FROM node:24-alpine AS builder
WORKDIR /app

# 패키지 설치
RUN corepack enable && corepack prepare pnpm@10 --activate
COPY package.json pnpm-lock.yaml* ./
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile --ignore-scripts

# 소스 복사 후 빌드
COPY . .
ARG VITE_API_BASE_URL
ARG VITE_GA_MEASUREMENT_ID
ARG VITE_TELEMETRY_ENABLED
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_GA_MEASUREMENT_ID=$VITE_GA_MEASUREMENT_ID
ENV VITE_TELEMETRY_ENABLED=$VITE_TELEMETRY_ENABLED
RUN pnpm build

# 2단계: 빌드 결과만 nginx로 서빙
FROM nginx:alpine
RUN rm -rf /usr/share/nginx/html/* && \
    mkdir -p /usr/share/nginx/html/groove
COPY --from=builder /app/dist /usr/share/nginx/html/groove
COPY nginx-default.conf /etc/nginx/conf.d/default.conf

COPY --chmod=755 <<-"EOF" /docker-entrypoint.d/40-replace-env.sh
#!/bin/sh
set -eu

# 치환 대상 디렉터리 (/groove 하위의 빌드 산출물)
TARGET_DIR="/usr/share/nginx/html/groove"

# 환경변수가 비어있을 경우 기본값 처리
API_URL="${VITE_API_BASE_URL:-}"
GA_ID="${VITE_GA_MEASUREMENT_ID:-}"
TELEMETRY="${VITE_TELEMETRY_ENABLED:-false}"

# dist 내의 모든 js 파일에서 플레이스홀더를 실제 환경변수로 치환
find "$TARGET_DIR" -type f -name "*.js" -exec sed -i \
  -e "s|__VITE_API_BASE_URL__|$API_URL|g" \
  -e "s|__VITE_GA_MEASUREMENT_ID__|$GA_ID|g" \
  -e "s|__VITE_TELEMETRY_ENABLED__|$TELEMETRY|g" \
  {} +
EOF

RUN sed -i 's/\r$//' /docker-entrypoint.d/40-replace-env.sh

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
