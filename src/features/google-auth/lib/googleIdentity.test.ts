const SCRIPT_SELECTOR = 'script[src="https://accounts.google.com/gsi/client"]';

afterEach(() => {
  document.querySelectorAll(SCRIPT_SELECTOR).forEach((script) => script.remove());
  delete window.google;
  vi.useRealTimers();
});

beforeEach(() => vi.resetModules());

const provideGoogle = () => {
  const api = { initialize: vi.fn(), renderButton: vi.fn() };
  window.google = { accounts: { id: api } };
  return api;
};

describe("Google Identity Services loading", () => {
  it("resolves immediately without injecting a script when Google is available", async () => {
    provideGoogle();
    const { loadGoogleIdentityScript } = await import("./googleIdentity");
    await expect(loadGoogleIdentityScript()).resolves.toBeUndefined();
    expect(document.querySelector(SCRIPT_SELECTOR)).toBeNull();
  });

  it("shares a pending request and creates a fresh script after failure", async () => {
    const { loadGoogleIdentityScript } = await import("./googleIdentity");
    const first = loadGoogleIdentityScript();
    expect(loadGoogleIdentityScript()).toBe(first);
    const failedScript = document.querySelector(SCRIPT_SELECTOR)!;
    const failure = expect(first).rejects.toThrow("failed to load");
    failedScript.dispatchEvent(new Event("error"));
    await failure;
    expect(failedScript.isConnected).toBe(false);

    const retry = loadGoogleIdentityScript();
    const nextScript = document.querySelector(SCRIPT_SELECTOR)!;
    expect(nextScript).not.toBe(failedScript);
    provideGoogle();
    nextScript.dispatchEvent(new Event("load"));
    await expect(retry).resolves.toBeUndefined();
  });

  it("fails and permits retry when an existing script never completes", async () => {
    vi.useFakeTimers();
    const existing = document.createElement("script");
    existing.src = "https://accounts.google.com/gsi/client";
    document.head.appendChild(existing);
    const { loadGoogleIdentityScript } = await import("./googleIdentity");
    const pending = loadGoogleIdentityScript();
    const failure = expect(pending).rejects.toThrow("failed to load");
    await vi.advanceTimersByTimeAsync(15_000);
    await failure;
    expect(existing.isConnected).toBe(false);
    const retry = loadGoogleIdentityScript();
    provideGoogle();
    document.querySelector(SCRIPT_SELECTOR)!.dispatchEvent(new Event("load"));
    await expect(retry).resolves.toBeUndefined();
  });

  it("rejects a load event without the expected Google API", async () => {
    const { loadGoogleIdentityScript } = await import("./googleIdentity");
    const pending = loadGoogleIdentityScript();
    const failure = expect(pending).rejects.toThrow("failed to load");
    document.querySelector(SCRIPT_SELECTOR)!.dispatchEvent(new Event("load"));
    await failure;
    expect(document.querySelector(SCRIPT_SELECTOR)).toBeNull();
  });

  it("initializes once and routes credentials only to a mounted button", async () => {
    const api = provideGoogle();
    const { renderGoogleSignInButton } = await import("./googleIdentity");
    const first = vi.fn();
    const second = vi.fn();
    const disposeFirst = renderGoogleSignInButton(
      document.createElement("div"),
      "fixture-client",
      first,
    );
    const disposeSecond = renderGoogleSignInButton(
      document.createElement("div"),
      "fixture-client",
      second,
    );
    expect(api.initialize).toHaveBeenCalledOnce();
    const callback = api.initialize.mock.calls[0]![0].callback;
    callback({ credential: "fixture-token" });
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledWith({ credential: "fixture-token" });
    disposeSecond();
    callback({ credential: "another-fixture-token" });
    expect(first).toHaveBeenCalledOnce();
    disposeFirst();
    callback({ credential: "discarded-fixture-token" });
    expect(first).toHaveBeenCalledOnce();
  });
});
