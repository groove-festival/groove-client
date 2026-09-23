import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

import { appConfig } from "@/shared/config";
import { useGoogleSignIn } from "@/entities/auth";

interface GoogleSignInGuideProps {
  onClose: () => void;
  onIdToken: (idToken: string) => void;
}

// 로그인 없이 투표를 시도했을 때 뜨는 안내 팝업 (PRD §11-9, node 1441:15314).
export function GoogleSignInGuide({ onClose, onIdToken }: GoogleSignInGuideProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const { hiddenButtonRef } = useGoogleSignIn({
    clientId: appConfig.googleClientId ?? "",
    onIdToken,
  });

  useEffect(() => {
    dialogRef.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return createPortal(
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        aria-label="가요제 투표 안내 사항"
        aria-modal="true"
        className="relative flex w-[320px] max-w-full flex-col items-center gap-10 rounded-[36px] bg-[#bbb4ae] px-7 py-8 text-[#fcfcfc] shadow-xl"
        ref={dialogRef}
        role="dialog"
        tabIndex={-1}
      >
        <button
          aria-label="안내 닫기"
          className="absolute top-8 right-8 size-5"
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

        <div className="flex flex-col items-center gap-3">
          <h2 className="text-2xl font-semibold">가요제 투표 안내 사항</h2>
          <ul className="list-disc space-y-2 self-start ps-[18px] text-xs leading-[15px]">
            <li>투표 후에는 수정할 수 없습니다.</li>
            <li>투표는 하나의 계정 기준, 한 경연당 한 번만 참여가능 합니다.</li>
            <li>공정한 투표를 위해 구글 로그인을 하여야 투표가 가능합니다.</li>
          </ul>
        </div>

        <div className="relative h-14 w-full">
          <div className="flex h-14 w-full items-center justify-center gap-2.5 rounded-2xl bg-[#ff0080]">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#fcfcfc] text-xs font-bold text-[#ff0080]">
              G
            </span>
            <span className="text-base font-semibold">Google로 계속하기</span>
          </div>
          <div
            aria-hidden="true"
            className="absolute inset-0 overflow-hidden opacity-0"
            data-testid="google-sign-in-overlay"
            ref={hiddenButtonRef}
          />
        </div>
      </section>
    </div>,
    document.body,
  );
}
