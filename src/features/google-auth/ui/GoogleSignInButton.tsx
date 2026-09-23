import { useEffect, useRef, useState } from "react";

import { appConfig } from "@/shared/config";

import { renderGoogleSignInButton } from "../model/googleIdentity";

interface GoogleSignInButtonProps {
  disabled?: boolean;
  onCredential: (credential: string) => void;
}

export const GoogleSignInButton = ({
  disabled = false,
  onCredential,
}: GoogleSignInButtonProps) => {
  const buttonRef = useRef<HTMLDivElement>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const clientId = appConfig.googleClientId;

  useEffect(() => {
    const element = buttonRef.current;

    if (!element || !clientId || disabled) {
      return;
    }

    let active = true;
    setErrorMessage(null);

    void renderGoogleSignInButton({
      clientId,
      element,
      onCredential: (credential) => {
        if (active) {
          onCredential(credential);
        }
      },
      onMissingCredential: () => {
        if (active) {
          setErrorMessage("Google 인증 정보를 받지 못했어요. 다시 시도해 주세요.");
        }
      },
    }).catch(() => {
      if (active) {
        setErrorMessage("Google 로그인 버튼을 불러오지 못했어요.");
      }
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
    <div className="flex flex-col gap-2">
      <div
        aria-label="Google 계정으로 로그인"
        className={disabled ? "pointer-events-none opacity-60" : ""}
        ref={buttonRef}
      />
      {errorMessage && (
        <p className="text-xs leading-[15px] text-[#ff5b5b]" role="alert">
          {errorMessage}
        </p>
      )}
    </div>
  );
};
