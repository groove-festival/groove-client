import { useRef, useState } from "react";
import { createPortal } from "react-dom";

import { GoogleSignInButton } from "@/features/google-auth";
import { getRestrictedInAppBrowser } from "@/shared/lib/in-app-browser";
import { InAppBrowserNotice, useDialogLifecycle } from "@/shared/ui";

import voteGuideIcon from "../festival-visuals/vote-guide-icon.svg";

interface GoogleSignInGuideProps {
  onClose: () => void;
  onIdToken: (idToken: string) => void;
  pending?: boolean;
  errorMessage?: string;
}

export function GoogleSignInGuide({
  onClose,
  onIdToken,
  pending = false,
  errorMessage,
}: GoogleSignInGuideProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const [restrictedInAppBrowser] = useState(() => getRestrictedInAppBrowser());

  useDialogLifecycle({ dialogRef, onDismiss: onClose });

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
        className="relative flex max-h-[calc(100dvh-32px)] w-[320px] max-w-full flex-col items-center gap-7 overflow-y-auto rounded-[36px] bg-[rgba(252,252,252,0.5)] px-6 pt-[52px] pb-8 text-[#fcfcfc] shadow-xl backdrop-blur-xl"
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

        <div className="flex w-[213px] flex-col items-center gap-3">
          <img alt="" className="h-[78px] w-[60.5px]" src={voteGuideIcon} />
          <h2 className="text-center text-2xl font-semibold">가요제 투표 안내 사항</h2>
        </div>

        <ul className="w-full list-disc space-y-4 ps-6 text-xs leading-[15px]">
          <li>
            투표를 한 번 확정하면{" "}
            <strong className="font-bold">이후 변경이 불가합니다.</strong>
          </li>
          <li>
            공정한 투표를 위해 <strong className="font-bold">Google 로그인</strong>이
            필요합니다.
            <br />한 계정당 경연마다 <strong className="font-bold">한 번만</strong>{" "}
            투표할 수 있습니다.
          </li>
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
        </ul>

        {errorMessage && (
          <p className="text-xs text-[#ff5b5b]" role="alert">
            {errorMessage}
          </p>
        )}
        {pending && (
          <p className="text-xs text-[#a2a2a2]" role="status">
            Google 로그인을 처리하는 중입니다
          </p>
        )}
        {restrictedInAppBrowser ? (
          <InAppBrowserNotice
            showIosSafariLocationGuide
            unavailableMessage="인스타그램·에브리타임 인앱에서는 Google 로그인을 사용할 수 없어요."
          />
        ) : (
          <GoogleSignInButton disabled={pending} onCredential={onIdToken} />
        )}
      </section>
    </div>,
    document.body,
  );
}
