import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { appConfig } from "@/shared/config";
import { useGoogleSignIn } from "@/entities/auth";
import { googleLogoIcon } from "@/shared/ui";

import voteGuideIcon from "../festival-visuals/vote-guide-icon.svg";

interface GoogleSignInGuideProps {
  onClose: () => void;
  onIdToken: (idToken: string) => void;
}

// 비로그인 상태로 투표를 시도했을 때만 뜨는 안내 팝업 (node 1441:16201).
export function GoogleSignInGuide({ onClose, onIdToken }: GoogleSignInGuideProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const { hiddenButtonRef } = useGoogleSignIn({
    clientId: appConfig.googleClientId ?? "",
    onIdToken,
  });
  const [isPressed, setIsPressed] = useState(false);
  const pressTimerRef = useRef<number | undefined>(undefined);

  const showPress = () => {
    window.clearTimeout(pressTimerRef.current);
    setIsPressed(true);
    pressTimerRef.current = window.setTimeout(() => setIsPressed(false), 150);
  };

  // 실제 구글 버튼은 교차 출처 iframe이라 :active가 이 문서에 오지 않는다.
  // iframe이 포커스를 가져가며 창이 blur되는 순간을 눌림으로 본다.
  useEffect(() => {
    const handleBlur = () => {
      window.setTimeout(() => {
        if (hiddenButtonRef.current?.contains(document.activeElement)) showPress();
      });
    };
    window.addEventListener("blur", handleBlur);
    return () => {
      window.removeEventListener("blur", handleBlur);
      window.clearTimeout(pressTimerRef.current);
    };
  }, [hiddenButtonRef]);

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
          {/* 줄바꿈은 <br />, 강조는 <strong className="font-bold">…</strong> */}
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

        <div className="relative h-14 w-full" onPointerDown={showPress}>
          <div
            className={`flex h-14 w-full items-center justify-center gap-2.5 rounded-[12px] bg-[#ff0080] transition-transform duration-150 ease-out motion-reduce:transition-none ${isPressed ? "scale-[0.97]" : ""}`}
          >
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#fcfcfc] p-1">
              <img alt="" className="size-full" src={googleLogoIcon} />
            </span>
            <span className="text-base font-semibold text-[#fcfcfc]">
              Google로 계속하기
            </span>
          </div>
          <div
            aria-hidden="true"
            className="absolute inset-0 flex items-center justify-center overflow-hidden opacity-0 [&>div]:scale-x-110 [&>div]:scale-y-150"
            data-testid="google-sign-in-overlay"
            ref={hiddenButtonRef}
          />
        </div>
      </section>
    </div>,
    document.body,
  );
}
