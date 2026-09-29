import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";

import microphone from "../festival-visuals/microphone.png";
import { GoogleSignInButton } from "./GoogleSignInButton";

interface StoryGuideModalProps {
  authError: boolean;
  authPending: boolean;
  isLoggedIn: boolean;
  isLoginPending: boolean;
  loginErrorMessage?: string;
  onClose: () => void;
  onContinue: () => void;
  onCredential: (credential: string) => void;
  onRetryAuth: () => void;
  open: boolean;
  wrongRole: boolean;
}

export const StoryGuideModal = ({
  authError,
  authPending,
  isLoggedIn,
  isLoginPending,
  loginErrorMessage,
  onClose,
  onContinue,
  onCredential,
  onRetryAuth,
  open,
  wrongRole,
}: StoryGuideModalProps) => {
  const titleId = useId();
  const descriptionId = useId();
  const dialogRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!open) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus({ preventScroll: true });
    };
  }, [onClose, open]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed top-0 left-1/2 z-[70] flex h-dvh w-full max-w-[600px] -translate-x-1/2 items-center justify-center overflow-y-auto bg-[rgba(28,28,28,0.5)] p-4 backdrop-blur-[4px]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        aria-describedby={descriptionId}
        aria-labelledby={titleId}
        aria-modal="true"
        className="relative flex max-h-[calc(100dvh-32px)] w-full max-w-[320px] flex-col items-center overflow-y-auto rounded-[36px] bg-[rgba(252,252,252,0.5)] px-6 pt-[52px] pb-8 text-[#fcfcfc] shadow-xl backdrop-blur-[24px] outline-none"
        onMouseDown={(event) => event.stopPropagation()}
        ref={dialogRef}
        role="dialog"
        tabIndex={-1}
      >
        <button
          aria-label="안내 닫기"
          className="absolute top-7 right-7 size-5"
          onClick={onClose}
          type="button"
        >
          <svg
            aria-hidden="true"
            className="size-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            viewBox="0 0 20 20"
          >
            <path d="M1 1l18 18M19 1 1 19" />
          </svg>
        </button>

        <img
          alt=""
          className="h-[83px] w-20 shrink-0 object-contain"
          src={microphone}
        />
        <h2 className="mt-3 w-full text-center text-2xl font-semibold" id={titleId}>
          사연 신청 안내 사항
        </h2>

        <ul
          className="mt-7 w-full list-disc space-y-4 pl-6 text-xs leading-[15px]"
          id={descriptionId}
        >
          <li>
            신청받은 사연을{" "}
            <strong className="font-bold">무대 진행 중 MC가 낭독</strong>
            하는
            <br />
            이벤트입니다.
          </li>
          <li>
            별명을 입력하지 않을 경우, 본명으로 사연을 소개
            <br />
            합니다.
          </li>
          <li>
            <strong className="font-bold">한 사람당 하나의 사연만 등록</strong>할 수
            있도록 하기 위해 Google 로그인 인증이 필요합니다.
          </li>
          {!isLoggedIn && (
            <>
              <li className="font-bold">
                Google 비밀번호는 GROOVE에 전달되지 않습
                <br />
                니다.
              </li>
              <li className="font-bold">
                Google에서 발급한 인증 정보로 로그인 상태만
                <br />
                확인합니다.
              </li>
            </>
          )}
        </ul>

        <div className="mt-7 flex w-full flex-col gap-3">
          {isLoggedIn ? (
            <button
              className="h-14 w-full rounded-[12px] bg-[#ff0080] text-base font-semibold transition-transform duration-150 ease-out active:scale-[0.97] motion-reduce:transition-none"
              onClick={onContinue}
              type="button"
            >
              사연 작성하기
            </button>
          ) : (
            <>
              {authPending && (
                <p className="text-center text-sm text-[#494949]" role="status">
                  로그인 상태를 확인하는 중입니다
                </p>
              )}
              {authError && (
                <div className="flex flex-col gap-2 rounded-2xl border border-[#ff5b5b] bg-[#323232]/70 p-3">
                  <p className="text-xs text-[#ffced8]">
                    로그인 상태를 확인하지 못했어요.
                  </p>
                  <button
                    className="text-left text-xs underline"
                    onClick={onRetryAuth}
                    type="button"
                  >
                    다시 확인하기
                  </button>
                </div>
              )}
              {wrongRole && (
                <p className="rounded-2xl border border-[#565656] bg-[#323232]/70 p-3 text-xs leading-5 text-[#fcfcfc]">
                  현재 계정은 가요제 참여자 계정이 아니에요. Google 계정으로 로그인해
                  주세요.
                </p>
              )}

              <GoogleSignInButton
                disabled={authPending || isLoginPending}
                onCredential={onCredential}
              />

              {isLoginPending && (
                <p className="text-center text-sm text-[#494949]" role="status">
                  Google 로그인을 처리하는 중입니다
                </p>
              )}
              {loginErrorMessage && (
                <p className="text-xs leading-[15px] text-[#ffced8]" role="alert">
                  {loginErrorMessage}
                </p>
              )}
            </>
          )}
        </div>
      </section>
    </div>,
    document.body,
  );
};
