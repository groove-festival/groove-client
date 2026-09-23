interface GoogleCredentialResponse {
  credential?: string;
}

interface GoogleButtonOptions {
  shape?: "pill" | "rectangular" | "circle" | "square";
  size?: "large" | "medium" | "small";
  text?: "signin_with" | "signup_with" | "continue_with" | "signin";
  theme?: "outline" | "filled_blue" | "filled_black";
  type?: "standard" | "icon";
  width?: number;
}

interface GoogleAccountsId {
  initialize(options: {
    client_id: string;
    callback: (response: GoogleCredentialResponse) => void;
  }): void;
  renderButton(parent: HTMLElement, options: GoogleButtonOptions): void;
}

interface GoogleIdentityNamespace {
  accounts: {
    id: GoogleAccountsId;
  };
}

declare global {
  interface Window {
    google?: GoogleIdentityNamespace;
  }
}

const GOOGLE_IDENTITY_SCRIPT_ID = "google-identity-services";
let googleIdentityPromise: Promise<GoogleIdentityNamespace> | null = null;

export function loadGoogleIdentity(): Promise<GoogleIdentityNamespace> {
  if (window.google?.accounts?.id) {
    return Promise.resolve(window.google);
  }

  if (googleIdentityPromise) {
    return googleIdentityPromise;
  }

  googleIdentityPromise = new Promise((resolve, reject) => {
    const existing = document.getElementById(GOOGLE_IDENTITY_SCRIPT_ID);

    const handleLoad = () => {
      if (window.google?.accounts?.id) {
        resolve(window.google);
        return;
      }
      reject(new Error("Google Identity Services did not initialize."));
    };

    if (existing) {
      existing.addEventListener("load", handleLoad, { once: true });
      existing.addEventListener(
        "error",
        () => reject(new Error("Google script failed.")),
        {
          once: true,
        },
      );
      return;
    }

    const script = document.createElement("script");
    script.async = true;
    script.defer = true;
    script.id = GOOGLE_IDENTITY_SCRIPT_ID;
    script.src = "https://accounts.google.com/gsi/client";
    script.addEventListener("load", handleLoad, { once: true });
    script.addEventListener("error", () => reject(new Error("Google script failed.")), {
      once: true,
    });
    document.head.appendChild(script);
  });

  return googleIdentityPromise;
}

export interface RenderGoogleSignInButtonArgs {
  clientId: string;
  element: HTMLElement;
  onCredential: (credential: string) => void;
  onMissingCredential: () => void;
}

export async function renderGoogleSignInButton({
  clientId,
  element,
  onCredential,
  onMissingCredential,
}: RenderGoogleSignInButtonArgs): Promise<void> {
  const google = await loadGoogleIdentity();

  google.accounts.id.initialize({
    client_id: clientId,
    callback: (response) => {
      if (response.credential) {
        onCredential(response.credential);
        return;
      }
      onMissingCredential();
    },
  });

  element.innerHTML = "";
  google.accounts.id.renderButton(element, {
    shape: "pill",
    size: "large",
    text: "signin_with",
    theme: "filled_blue",
    type: "standard",
    width: Math.min(element.clientWidth || 361, 361),
  });
}
