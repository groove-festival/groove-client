// Google Identity Services(GIS)의 최소 타입 선언. 공식 @types 패키지가 없어
// 실제 쓰는 부분만 직접 선언한다.
interface GoogleIdCredentialResponse {
  credential: string;
}

interface GoogleButtonOptions {
  type: "standard";
  shape?: "pill" | "rectangular" | "circle" | "square";
  size?: "large" | "medium" | "small";
  text?: "signin_with" | "signup_with" | "continue_with" | "signin";
  theme?: "outline" | "filled_blue" | "filled_black";
  width?: number;
}

interface GoogleAccountsId {
  initialize: (config: {
    client_id: string;
    callback: (response: GoogleIdCredentialResponse) => void;
  }) => void;
  renderButton: (parent: HTMLElement, options: GoogleButtonOptions) => void;
}

declare global {
  interface Window {
    google?: { accounts: { id: GoogleAccountsId } };
  }
}

const GIS_SCRIPT_SRC = "https://accounts.google.com/gsi/client";

let scriptLoadPromise: Promise<void> | undefined;

// GIS 스크립트를 필요할 때만 한 번 로드한다. 이 페이지에서만 쓰는 외부
// 스크립트를 index.html에 전역으로 넣지 않기 위함이다.
export function loadGoogleIdentityScript(): Promise<void> {
  if (window.google?.accounts.id) {
    return Promise.resolve();
  }

  scriptLoadPromise ??= new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${GIS_SCRIPT_SRC}"]`,
    );
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("GIS script failed to load")));
      return;
    }

    const script = document.createElement("script");
    script.src = GIS_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.addEventListener("load", () => resolve());
    script.addEventListener("error", () =>
      reject(new Error("GIS script failed to load")),
    );
    document.head.appendChild(script);
  });

  return scriptLoadPromise;
}

export type { GoogleIdCredentialResponse };
