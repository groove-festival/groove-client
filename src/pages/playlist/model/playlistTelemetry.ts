import type { PlaylistPhase } from "@/entities/festival";
import { ApiError } from "@/shared/api";
import { trackTelemetryEvent } from "@/shared/lib/telemetry";

import type { SongRequestFormValues } from "./songRequestForm";

const SAFE_ERROR_CODE_PATTERN = /^[A-Z][A-Z0-9_]{0,31}$/;

export type DurationBucket = "1s_to_3s" | "3s_to_10s" | "10s_or_more" | "under_1s";
export type ResultCountBucket = "0" | "1_to_5" | "6_to_10" | "over_10";
export type ValidationField = keyof SongRequestFormValues | "unknown";

export type PlaylistTelemetryEvent =
  | { eventName: "playlist_view"; phase: PlaylistPhase }
  | { eventName: "playlist_form_start" }
  | {
      eventName: "playlist_form_validation_failure";
      validation_field: ValidationField;
    }
  | { eventName: "playlist_form_view" }
  | { eventName: "song_search_attempt" }
  | { duration_bucket: DurationBucket; eventName: "song_search_empty" }
  | {
      duration_bucket: DurationBucket;
      eventName: "song_search_failure";
      error_code: string;
    }
  | {
      duration_bucket: DurationBucket;
      eventName: "song_search_success";
      result_count_bucket: Exclude<ResultCountBucket, "0">;
    }
  | { eventName: "song_select" }
  | { eventName: "song_submit_attempt" }
  | {
      duration_bucket: DurationBucket;
      eventName: "song_submit_failure";
      error_code: string;
    }
  | { duration_bucket: DurationBucket; eventName: "song_submit_success" };

export function toDurationBucket(durationMs: number): DurationBucket {
  if (durationMs < 1_000) {
    return "under_1s";
  }
  if (durationMs < 3_000) {
    return "1s_to_3s";
  }
  if (durationMs < 10_000) {
    return "3s_to_10s";
  }
  return "10s_or_more";
}

export function toResultCountBucket(resultCount: number): ResultCountBucket {
  if (resultCount <= 0) {
    return "0";
  }
  if (resultCount <= 5) {
    return "1_to_5";
  }
  if (resultCount <= 10) {
    return "6_to_10";
  }
  return "over_10";
}

export function toSafeErrorCode(error: unknown): string {
  if (error instanceof ApiError && SAFE_ERROR_CODE_PATTERN.test(error.code)) {
    return error.code;
  }

  return "UNKNOWN";
}

export function trackPlaylistEvent(event: PlaylistTelemetryEvent): void {
  const { eventName, ...parameters } = event;
  trackTelemetryEvent(eventName, parameters);
}
