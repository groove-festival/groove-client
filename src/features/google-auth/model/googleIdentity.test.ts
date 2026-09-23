import { renderGoogleSignInButton } from "./googleIdentity";

describe("renderGoogleSignInButton", () => {
  it("initializes Google Identity Services and forwards the ID token", async () => {
    const onCredential = vi.fn();
    const onMissingCredential = vi.fn();
    let credentialCallback: ((response: { credential?: string }) => void) | undefined;
    const initialize = vi.fn(
      (options: {
        client_id: string;
        callback: (response: { credential?: string }) => void;
      }) => {
        credentialCallback = options.callback;
      },
    );
    const renderButton = vi.fn();
    vi.stubGlobal("google", { accounts: { id: { initialize, renderButton } } });
    const element = document.createElement("div");

    await renderGoogleSignInButton({
      clientId: "test-client-id.apps.googleusercontent.com",
      element,
      onCredential,
      onMissingCredential,
    });

    expect(initialize).toHaveBeenCalledWith({
      client_id: "test-client-id.apps.googleusercontent.com",
      callback: expect.any(Function),
    });
    expect(renderButton).toHaveBeenCalledWith(
      element,
      expect.objectContaining({ text: "signin_with", type: "standard" }),
    );

    credentialCallback?.({ credential: "test-id-token" });
    expect(onCredential).toHaveBeenCalledWith("test-id-token");

    credentialCallback?.({});
    expect(onMissingCredential).toHaveBeenCalledOnce();
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
});
