import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";

import {
  LoadingFallback,
  MaintenanceFallback,
  NetworkErrorFallback,
  NotFoundFallback,
} from ".";

describe("FallbackScreen", () => {
  it("renders the not-found fallback with a home link", () => {
    render(
      <MemoryRouter>
        <NotFoundFallback />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole("heading", { name: "페이지를 찾을 수 없어요" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "홈으로 가기" })).toHaveAttribute(
      "href",
      "/",
    );
  });

  it("renders the network fallback with a refresh action", () => {
    const onReload = vi.fn();

    render(<NetworkErrorFallback onReload={onReload} />);
    fireEvent.click(screen.getByRole("button", { name: "페이지 새로고침" }));

    expect(
      screen.getByRole("heading", {
        name: "네트워크 연결 상태를 확인 후 다시 시도해 주세요",
      }),
    ).toBeInTheDocument();
    expect(onReload).toHaveBeenCalledTimes(1);
  });

  it("renders the maintenance fallback with a refresh action", () => {
    const onReload = vi.fn();

    render(<MaintenanceFallback onReload={onReload} />);
    fireEvent.click(screen.getByRole("button", { name: "페이지 새로고침" }));

    expect(
      screen.getByRole("heading", { name: "서비스 점검 중이에요" }),
    ).toBeInTheDocument();
    expect(onReload).toHaveBeenCalledTimes(1);
  });

  it("renders the loading fallback", () => {
    render(<LoadingFallback />);

    expect(screen.getByRole("status")).toHaveTextContent("잠시만 기다려주세요");
  });
});
