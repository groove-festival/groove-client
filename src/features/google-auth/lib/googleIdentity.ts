interface GoogleIdCredentialResponse {
  credential: string;
}

interface GoogleAccountsId {
  initialize: (config: {
    client_id: string;
    callback: (response: GoogleIdCredentialResponse) => void;
  }) => void;
  renderButton: (
    parent: HTMLElement,
    options: {
      type: "standard";
      shape: "pill";
      size: "large";
      text: "signin_with";
      theme: "filled_blue";
      width: number;
    },
  ) => void;
}

declare global {
  interface Window {
    google?: { accounts: { id: GoogleAccountsId } };
  }
}

const GIS_SCRIPT_SRC = "https://accounts.google.com/gsi/client";
const SCRIPT_LOAD_TIMEOUT_MS = 15_000;
let scriptLoadPromise: Promise<void> | undefined;
let initializedApi: GoogleAccountsId | undefined;
let initializedClientId: string | undefined;
const credentialHandlers: ((response: GoogleIdCredentialResponse) => void)[] = [];

export function loadGoogleIdentityScript(): Promise<void> {
  if (window.google?.accounts.id) return Promise.resolve();
  if (scriptLoadPromise) return scriptLoadPromise;

  const script =
    document.querySelector<HTMLScriptElement>(`script[src="${GIS_SCRIPT_SRC}"]`) ??
    document.createElement("script");
  scriptLoadPromise = new Promise<void>((resolve, reject) => {
    const cleanup = () => {
      window.clearTimeout(timeout);
      script.removeEventListener("load", onLoad);
      script.removeEventListener("error", onError);
    };
    const onError = () => {
      cleanup();
      reject(new Error("Google Identity Services failed to load"));
    };
    const onLoad = () => {
      if (!window.google?.accounts.id) {
        onError();
        return;
      }
      cleanup();
      resolve();
    };
    const timeout = window.setTimeout(onError, SCRIPT_LOAD_TIMEOUT_MS);
    script.addEventListener("load", onLoad);
    script.addEventListener("error", onError);
    if (!script.isConnected) {
      script.src = GIS_SCRIPT_SRC;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
  }).then(
    () => {
      scriptLoadPromise = undefined;
    },
    (error: unknown) => {
      scriptLoadPromise = undefined;
      script.remove();
      throw error;
    },
  );
  return scriptLoadPromise;
}

export function renderGoogleSignInButton(
  element: HTMLElement,
  clientId: string,
  onCredential: (response: GoogleIdCredentialResponse) => void,
): () => void {
  const api = window.google?.accounts.id;
  if (!api) throw new Error("Google Identity Services is unavailable");
  if (initializedApi !== api || initializedClientId !== clientId) {
    api.initialize({
      client_id: clientId,
      callback: (response) => credentialHandlers.at(-1)?.(response),
    });
    initializedApi = api;
    initializedClientId = clientId;
  }
  element.replaceChildren();
  api.renderButton(element, {
    shape: "pill",
    size: "large",
    text: "signin_with",
    theme: "filled_blue",
    type: "standard",
    width: Math.min(element.clientWidth || 361, 361),
  });
  credentialHandlers.push(onCredential);
  return () => {
    const index = credentialHandlers.indexOf(onCredential);
    if (index !== -1) credentialHandlers.splice(index, 1);
    element.replaceChildren();
  };
}
