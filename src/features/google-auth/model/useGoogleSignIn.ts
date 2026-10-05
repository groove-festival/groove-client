import { useEffect, useRef, useState } from "react";

import {
  loadGoogleIdentityScript,
  renderGoogleSignInButton,
} from "../lib/googleIdentity";

interface UseGoogleSignInArgs {
  clientId: string;
  enabled?: boolean;
  onCredential: (credential: string) => void;
}

type GoogleSignInStatus = "loading" | "ready" | "error";

interface GoogleSignInResult {
  clientId: string;
  attempt: number;
  status: GoogleSignInStatus;
  errorMessage?: string;
}

export const useGoogleSignIn = ({
  clientId,
  enabled = true,
  onCredential,
}: UseGoogleSignInArgs) => {
  const buttonRef = useRef<HTMLDivElement>(null);
  const onCredentialRef = useRef(onCredential);
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<GoogleSignInResult>();
  const currentResult =
    enabled && result?.clientId === clientId && result.attempt === attempt
      ? result
      : undefined;

  useEffect(() => {
    onCredentialRef.current = onCredential;
  }, [onCredential]);

  useEffect(() => {
    if (!clientId || !enabled) return;
    let active = true;
    let dispose: (() => void) | undefined;
    void loadGoogleIdentityScript()
      .then(() => {
        if (!active || !buttonRef.current) return;
        dispose = renderGoogleSignInButton(buttonRef.current, clientId, (response) => {
          if (!active) return;
          if (!response.credential) {
            setResult({
              clientId,
              attempt,
              status: "error",
              errorMessage: "Google 인증 정보를 받지 못했어요. 다시 시도해 주세요.",
            });
            return;
          }
          onCredentialRef.current(response.credential);
        });
        setResult({ clientId, attempt, status: "ready" });
      })
      .catch(() => {
        if (!active) return;
        setResult({
          clientId,
          attempt,
          status: "error",
          errorMessage: "Google 로그인 버튼을 불러오지 못했어요.",
        });
      });
    return () => {
      active = false;
      dispose?.();
    };
  }, [attempt, clientId, enabled]);

  return {
    buttonRef,
    status: currentResult?.status ?? "loading",
    errorMessage: currentResult?.errorMessage,
    retry: () => setAttempt((current) => current + 1),
  };
};
