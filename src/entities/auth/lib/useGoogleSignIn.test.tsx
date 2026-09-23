import { render, screen, waitFor } from "@testing-library/react";

import { useGoogleSignIn } from "./useGoogleSignIn";

vi.mock("./googleIdentity", () => ({
  loadGoogleIdentityScript: vi.fn(() => Promise.resolve()),
}));

function TestComponent({ onIdToken }: { onIdToken: (idToken: string) => void }) {
  const { hiddenButtonRef, ready } = useGoogleSignIn({
    clientId: "test-client-id",
    onIdToken,
  });
  return (
    <div>
      <div data-testid="gis-button" ref={hiddenButtonRef} />
      <span data-testid="ready">{String(ready)}</span>
    </div>
  );
}

afterEach(() => {
  vi.clearAllMocks();
  delete window.google;
});

describe("useGoogleSignIn", () => {
  it("initializes GIS with the client id and renders the hidden button", async () => {
    const initialize = vi.fn();
    const renderButton = vi.fn();
    window.google = { accounts: { id: { initialize, renderButton } } };

    render(<TestComponent onIdToken={vi.fn()} />);

    await waitFor(() => expect(screen.getByTestId("ready")).toHaveTextContent("true"));
    expect(initialize).toHaveBeenCalledWith(
      expect.objectContaining({ client_id: "test-client-id" }),
    );
    expect(renderButton).toHaveBeenCalledWith(screen.getByTestId("gis-button"), {
      type: "standard",
    });
  });

  it("forwards the credential to onIdToken via the initialize callback", async () => {
    let capturedCallback: ((response: { credential: string }) => void) | undefined;
    const initialize = vi.fn(
      (config: { callback: (response: { credential: string }) => void }) => {
        capturedCallback = config.callback;
      },
    );
    window.google = { accounts: { id: { initialize, renderButton: vi.fn() } } };

    const onIdToken = vi.fn();
    render(<TestComponent onIdToken={onIdToken} />);

    await waitFor(() => expect(initialize).toHaveBeenCalled());
    capturedCallback?.({ credential: "id-token-abc" });

    expect(onIdToken).toHaveBeenCalledWith("id-token-abc");
  });
});
