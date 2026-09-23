import { useEffect, useRef, useState } from "react";

import { loadGoogleIdentityScript } from "./googleIdentity";

interface UseGoogleSignInArgs {
  clientId: string;
  onIdToken: (idToken: string) => void;
}

// 피그마 디자인은 구글 기본 버튼이 아니라 커스텀 스타일 버튼이라, 실제
// 구글 버튼을 투명하게 렌더링해 커스텀 버튼 위에 겹쳐두고 클릭을 위임한다
// (사용자 제스처가 있어야 하는 팝업 정책을 우회하는 표준 방식).
export function useGoogleSignIn({ clientId, onIdToken }: UseGoogleSignInArgs) {
  const hiddenButtonRef = useRef<HTMLDivElement>(null);
  const onIdTokenRef = useRef(onIdToken);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    onIdTokenRef.current = onIdToken;
  });

  useEffect(() => {
    let cancelled = false;

    loadGoogleIdentityScript()
      .then(() => {
        if (cancelled || !window.google || !hiddenButtonRef.current) return;

        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: (response) => onIdTokenRef.current(response.credential),
        });
        window.google.accounts.id.renderButton(hiddenButtonRef.current, {
          type: "standard",
        });
        setReady(true);
      })
      .catch(() => {
        if (!cancelled) setReady(false);
      });

    return () => {
      cancelled = true;
    };
  }, [clientId]);

  return { hiddenButtonRef, ready };
}
