import { useEffect, useRef, useState } from "react";

import { appConfig } from "@/shared/config";
import { getRestrictedInAppBrowser } from "@/shared/lib/in-app-browser";
import { googleLogoIcon, InAppBrowserNotice } from "@/shared/ui";

import { useGoogleSignIn } from "../../model/useGoogleSignIn";

interface GoogleSignInButtonProps {
  disabled?: boolean;
  onCredential: (credential: string) => void;
}

export const GoogleSignInButton = ({
  disabled = false,
  onCredential,
}: GoogleSignInButtonProps) => {
  const [restrictedBrowser] = useState(getRestrictedInAppBrowser);
  const clientId = appConfig.googleClientId ?? "";
  const { buttonRef, status, errorMessage, retry } = useGoogleSignIn({
    clientId,
    enabled: !disabled && restrictedBrowser === null,
    onCredential,
  });
  const [isPressed, setIsPressed] = useState(false);
  const pressTimerRef = useRef<number | undefined>(undefined);
  const blurTimerRef = useRef<number | undefined>(undefined);
  const showPress = () => {
    window.clearTimeout(pressTimerRef.current);
    setIsPressed(true);
    pressTimerRef.current = window.setTimeout(() => setIsPressed(false), 150);
  };

  useEffect(() => {
    const onBlur = () => {
      blurTimerRef.current = window.setTimeout(() => {
        if (buttonRef.current?.contains(document.activeElement)) showPress();
      });
    };
    window.addEventListener("blur", onBlur);
    return () => {
      window.removeEventListener("blur", onBlur);
      window.clearTimeout(pressTimerRef.current);
      window.clearTimeout(blurTimerRef.current);
    };
  }, [buttonRef]);

  if (restrictedBrowser)
    return (
      <InAppBrowserNotice
        showIosSafariLocationGuide
        unavailableMessage="인스타그램·에브리타임 인앱에서는 Google 로그인을 사용할 수 없어요."
      />
    );
  if (!clientId)
    return (
      <p
        className="rounded-2xl border border-[#ff5b5b] bg-[#323232] px-4 py-3 text-xs leading-5 text-[#ff9ab0]"
        role="alert"
      >
        Google 로그인 설정이 아직 완료되지 않았어요. 운영팀에 문의해 주세요.
      </p>
    );
  const canSignIn = !disabled && status === "ready";

  return (
    <div className="flex w-full flex-col gap-2">
      <div
        className={`relative h-14 w-full ${canSignIn ? "" : "pointer-events-none opacity-60"}`}
        onPointerDown={showPress}
      >
        <div
          aria-hidden="true"
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
          aria-label="Google 계정으로 로그인"
          inert={!canSignIn}
          className="absolute inset-0 flex items-center justify-center overflow-hidden opacity-0 [&>div]:scale-x-110 [&>div]:scale-y-150"
          data-testid="google-sign-in-overlay"
          ref={buttonRef}
        />
      </div>
      {!disabled && status === "loading" && (
        <p className="text-xs text-[#a2a2a2]" role="status">
          Google 로그인 버튼을 불러오는 중이에요.
        </p>
      )}
      {!disabled && status === "error" && (
        <div className="text-xs text-[#ff5b5b]">
          <p role="alert">{errorMessage}</p>
          <button className="mt-2 underline" onClick={retry} type="button">
            Google 로그인 다시 시도
          </button>
        </div>
      )}
    </div>
  );
};
