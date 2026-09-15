import { type FormEvent, useEffect, useRef, useState } from "react";
import type { FieldErrors, UseFormHandleSubmit } from "react-hook-form";

import { toSubmitSongBody, useSubmitSong } from "../api/submitSong";
import {
  toDurationBucket,
  toSafeErrorCode,
  trackPlaylistEvent,
} from "./playlistTelemetry";
import type { CompletedSong, SongRequestFormValues } from "./songRequestForm";

// 검증, 제출 요청, 완료 상태와 제출 관련 분석 이벤트를 관리한다.
export function useSongRequestSubmission(
  handleSubmit: UseFormHandleSubmit<SongRequestFormValues>,
) {
  const [completedSong, setCompletedSong] = useState<CompletedSong | null>(null);
  const hasStartedFormRef = useRef(false);
  const submit = useSubmitSong();

  const onValid = (values: SongRequestFormValues, startedAt: number) => {
    trackPlaylistEvent({ eventName: "song_submit_attempt" });
    submit.mutate(
      { body: toSubmitSongBody(values), idempotencyKey: crypto.randomUUID() },
      {
        onSuccess: (result) => {
          trackPlaylistEvent({
            duration_bucket: toDurationBucket(performance.now() - startedAt),
            eventName: "song_submit_success",
          });
          setCompletedSong({
            title: result.title,
            artist: result.artist,
            albumCoverUrl: result.albumCoverUrl,
          });
        },
        onError: (error) => {
          trackPlaylistEvent({
            duration_bucket: toDurationBucket(performance.now() - startedAt),
            error_code: toSafeErrorCode(error),
            eventName: "song_submit_failure",
          });
        },
      },
    );
  };

  const onInvalid = (validationErrors: FieldErrors<SongRequestFormValues>) => {
    const field = Object.keys(validationErrors)[0] as
      keyof SongRequestFormValues | undefined;
    trackPlaylistEvent({
      eventName: "playlist_form_validation_failure",
      validation_field: field ?? "unknown",
    });
  };

  const handleFormSubmit = (event: FormEvent<HTMLFormElement>) => {
    const startedAt = performance.now();
    void handleSubmit((values) => onValid(values, startedAt), onInvalid)(event);
  };

  const markFormStarted = () => {
    if (hasStartedFormRef.current) {
      return;
    }

    hasStartedFormRef.current = true;
    trackPlaylistEvent({ eventName: "playlist_form_start" });
  };

  const closeCompleteModal = () => {
    setCompletedSong(null);
    submit.reset();
  };

  useEffect(() => {
    trackPlaylistEvent({ eventName: "playlist_form_view" });
  }, []);

  return {
    completedSong,
    isSubmitting: submit.isPending,
    isSubmitError: submit.isError,
    submitError: submit.error,
    resetSubmit: () => submit.reset(),
    handleFormSubmit,
    markFormStarted,
    closeCompleteModal,
  };
}
