import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { InAppBrowserNotice } from "./InAppBrowserNotice";

const writeText = vi.fn();

beforeEach(() => {
  window.history.replaceState({}, "", "/groove/contest?tab=cast");
  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: { writeText },
  });
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("InAppBrowserNotice", () => {
  it("copies the complete current address and confirms it", async () => {
    writeText.mockResolvedValue(undefined);
    render(
      <InAppBrowserNotice
        showIosSafariLocationGuide
        unavailableMessage="인앱에서는 사용할 수 없어요."
      />,
    );

    expect(
      screen.getByText("아이폰 iOS의 경우(사파리) 위치 허용 방법:"),
    ).toBeInTheDocument();
    expect(screen.getByText("설정 앱 → 개인정보 보호 및 보안")).toBeInTheDocument();
    expect(
      screen.getByText("→ 위치 서비스 → Safari 웹사이트에서 설정"),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "주소 복사" }));

    await waitFor(() => expect(writeText).toHaveBeenCalledWith(window.location.href));
    expect(
      screen.getByRole("button", { name: "주소를 복사했어요" }),
    ).toBeInTheDocument();
  });

  it("shows a failure message when clipboard and fallback copying both fail", async () => {
    writeText.mockRejectedValue(new Error("blocked"));
    Object.defineProperty(document, "execCommand", {
      configurable: true,
      value: vi.fn(() => false),
    });
    render(<InAppBrowserNotice unavailableMessage="인앱에서는 사용할 수 없어요." />);

    fireEvent.click(screen.getByRole("button", { name: "주소 복사" }));

    expect(await screen.findByRole("status")).toHaveTextContent(
      "주소를 복사하지 못했어요.",
    );
  });

  it("copies with the fallback when the exposed clipboard API rejects", async () => {
    writeText.mockRejectedValueOnce(new Error("blocked"));
    const copy = vi.fn(() => true);
    Object.defineProperty(document, "execCommand", { configurable: true, value: copy });
    render(<InAppBrowserNotice unavailableMessage="인앱에서는 사용할 수 없어요." />);
    fireEvent.click(screen.getByRole("button", { name: "주소 복사" }));

    expect(
      await screen.findByRole("button", { name: "주소를 복사했어요" }),
    ).toBeInTheDocument();
    expect(copy).toHaveBeenCalledWith("copy");
    expect(document.querySelector("textarea")).toBeNull();
  });
});
