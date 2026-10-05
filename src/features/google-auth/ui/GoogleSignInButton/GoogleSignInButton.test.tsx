import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";

import { GoogleSignInButton } from "./GoogleSignInButton";

const config = vi.hoisted(() => ({ googleClientId: "fixture-client" }));
vi.mock("@/shared/config", () => ({ appConfig: config }));
const REGULAR_BROWSER = "Mozilla/5.0 Chrome/140.0.0.0 Mobile Safari/537.36";
const SCRIPT_SELECTOR = 'script[src="https://accounts.google.com/gsi/client"]';

beforeEach(() => {
  config.googleClientId = "fixture-client";
  Object.defineProperty(navigator, "userAgent", {
    configurable: true,
    value: REGULAR_BROWSER,
  });
});
afterEach(() => {
  delete window.google;
  document.querySelectorAll(SCRIPT_SELECTOR).forEach((script) => script.remove());
  vi.restoreAllMocks();
});

const provideGoogle = () => {
  const api = {
    initialize: vi.fn(),
    renderButton: vi.fn((element: HTMLElement) => {
      const button = document.createElement("button");
      button.textContent = "Google 계정 선택";
      element.appendChild(button);
    }),
  };
  window.google = { accounts: { id: api } };
  return api;
};

describe("GoogleSignInButton", () => {
  it("uses the latest credential handler without initializing again on rerender", async () => {
    const api = provideGoogle();
    const first = vi.fn();
    const second = vi.fn();
    const view = render(<GoogleSignInButton onCredential={first} />);
    await waitFor(() => expect(api.renderButton).toHaveBeenCalledOnce());
    expect(api.initialize).toHaveBeenCalledWith(
      expect.objectContaining({ client_id: "fixture-client" }),
    );
    expect(api.renderButton).toHaveBeenCalledWith(
      screen.getByTestId("google-sign-in-overlay"),
      expect.objectContaining({ type: "standard", shape: "pill" }),
    );
    view.rerender(<GoogleSignInButton onCredential={second} />);
    act(() =>
      api.initialize.mock.calls[0]![0].callback({ credential: "fixture-token" }),
    );
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledWith("fixture-token");
    expect(api.initialize).toHaveBeenCalledOnce();
    view.unmount();
    act(() =>
      api.initialize.mock.calls[0]![0].callback({ credential: "late-fixture-token" }),
    );
    expect(second).toHaveBeenCalledOnce();
  });

  it("keeps a disabled sign-in button inert", () => {
    const api = provideGoogle();
    render(<GoogleSignInButton disabled onCredential={vi.fn()} />);
    expect(screen.getByTestId("google-sign-in-overlay")).toHaveAttribute("inert");
    expect(api.initialize).not.toHaveBeenCalled();
  });

  it("explains missing configuration without loading Google", () => {
    config.googleClientId = "";
    render(<GoogleSignInButton onCredential={vi.fn()} />);
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Google 로그인 설정이 아직 완료되지 않았어요",
    );
    expect(document.querySelector(SCRIPT_SELECTOR)).toBeNull();
  });

  it("does not load Google inside a restricted in-app browser", () => {
    Object.defineProperty(navigator, "userAgent", {
      configurable: true,
      value: "Everytime/7.2.1 Android WebView",
    });
    render(<GoogleSignInButton onCredential={vi.fn()} />);
    expect(
      screen.getByText(/인앱에서는 Google 로그인을 사용할 수 없어요/),
    ).toBeInTheDocument();
    expect(document.querySelector(SCRIPT_SELECTOR)).toBeNull();
  });

  it("shows loading, failure and a successful retry", async () => {
    render(<GoogleSignInButton onCredential={vi.fn()} />);
    expect(screen.getByRole("status")).toHaveTextContent("불러오는 중");
    act(() =>
      document.querySelector(SCRIPT_SELECTOR)!.dispatchEvent(new Event("error")),
    );
    expect(await screen.findByRole("alert")).toHaveTextContent("불러오지 못했어요");
    fireEvent.click(screen.getByRole("button", { name: "Google 로그인 다시 시도" }));
    const api = provideGoogle();
    act(() =>
      document.querySelector(SCRIPT_SELECTOR)!.dispatchEvent(new Event("load")),
    );
    await waitFor(() => expect(api.renderButton).toHaveBeenCalledOnce());
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.getByTestId("google-sign-in-overlay")).not.toHaveAttribute("inert");
  });
});
