import { useEffect, useRef, useState } from "react";

import { loadGoogleIdentityScript } from "@/entities/auth";
import { appConfig } from "@/shared/config";

import googleLogo from "../festival-visuals/google-logo.png";

interface GoogleSignInButtonProps {
  disabled?: boolean;
  onCredential: (credential: string) => void;
}

// 구글 기본 버튼은 색을 바꿀 수 없어, 투표 흐름처럼 핑크 커스텀 버튼 위에
// 실제 구글 버튼을 투명하게 겹쳐 클릭을 위임한다.
export const GoogleSignInButton = ({
  disabled = false,
  onCredential,
}: GoogleSignInButtonProps) => {
  const buttonRef = useRef<HTMLDivElement>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPressed, setIsPressed] = useState(false);
  const pressTimerRef = useRef<number | undefined>(undefined);
  const clientId = appConfig.googleClientId;

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
        if (buttonRef.current?.contains(document.activeElement)) showPress();
      });
    };
    window.addEventListener("blur", handleBlur);
    return () => {
      window.removeEventListener("blur", handleBlur);
      window.clearTimeout(pressTimerRef.current);
    };
  }, []);

  useEffect(() => {
    const element = buttonRef.current;
    if (!element || !clientId || disabled) {
      return;
    }

    let active = true;
    setErrorMessage(null);

    loadGoogleIdentityScript()
      .then(() => {
        if (!active || !window.google) return;

        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: (response) => {
            if (!active) return;
            if (response.credential) {
              onCredential(response.credential);
              return;
            }
            setErrorMessage("Google 인증 정보를 받지 못했어요. 다시 시도해 주세요.");
          },
        });
        element.innerHTML = "";
        window.google.accounts.id.renderButton(element, {
          shape: "pill",
          size: "large",
          text: "signin_with",
          theme: "filled_blue",
          type: "standard",
          width: Math.min(element.clientWidth || 361, 361),
        });
      })
      .catch(() => {
        if (active) setErrorMessage("Google 로그인 버튼을 불러오지 못했어요.");
      });

    return () => {
      active = false;
    };
  }, [clientId, disabled, onCredential]);

  if (!clientId) {
    return (
      <p className="rounded-2xl border border-[#ff5b5b] bg-[#323232] px-4 py-3 text-xs leading-5 text-[#ff9ab0]">
        {import.meta.env.DEV
          ? "Google 웹 클라이언트 ID가 없어요. .env.local에 VITE_GOOGLE_CLIENT_ID를 설정하고 개발 서버를 다시 시작해 주세요."
          : "Google 로그인 설정이 아직 완료되지 않았어요. 운영팀에 문의해 주세요."}
      </p>
    );
  }

  return (
    <div className="flex w-full flex-col gap-2">
      <div
        className={`relative h-14 w-full ${disabled ? "pointer-events-none opacity-60" : ""}`}
        onPointerDown={showPress}
      >
        <div
          className={`flex h-14 w-full items-center justify-center gap-2.5 rounded-[12px] bg-[#ff0080] transition-transform duration-150 ease-out motion-reduce:transition-none ${isPressed ? "scale-[0.97]" : ""}`}
        >
          <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#fcfcfc] p-1">
            <img alt="" className="size-full" src={googleLogo} />
          </span>
          <span className="text-base font-semibold text-[#fcfcfc]">
            Google로 계속하기
          </span>
        </div>
        <div
          aria-label="Google 계정으로 로그인"
          className="absolute inset-0 flex items-center justify-center overflow-hidden opacity-0 [&>div]:scale-x-110 [&>div]:scale-y-150"
          ref={buttonRef}
        />
      </div>
      {errorMessage && (
        <p className="text-xs leading-[15px] text-[#ff5b5b]" role="alert">
          {errorMessage}
        </p>
      )}
    </div>
  );
};
