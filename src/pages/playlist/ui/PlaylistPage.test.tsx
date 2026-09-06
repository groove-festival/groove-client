import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";

import PlaylistPage from "./PlaylistPage";

const renderAtPhase = (phase?: string) => {
  const path = phase ? `/?phase=${phase}` : "/";
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[path]}>
        <PlaylistPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
};

describe("PlaylistPage", () => {
  it("renders the shared festival hero", () => {
    renderAtPhase("during");

    expect(
      screen.getByRole("heading", { name: "GROOVE FESTIVAL" }),
    ).toBeInTheDocument();
  });

  it("shows the song request form during the application phase", () => {
    renderAtPhase("during");

    expect(
      screen.getByRole("heading", { name: "노래 신청하기" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "신청하기" })).toBeInTheDocument();
  });

  it("defaults to the application phase without a phase param", () => {
    renderAtPhase();

    expect(
      screen.getByRole("heading", { name: "노래 신청하기" }),
    ).toBeInTheDocument();
  });

  it("changes the selected college", () => {
    renderAtPhase("during");

    const nursingButton = screen.getByRole("button", { name: "간호" });
    fireEvent.click(nursingButton);

    expect(nursingButton).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "IT" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  it("shows the countdown before the application opens", () => {
    renderAtPhase("before");

    expect(screen.getByText("COUNTDOWN")).toBeInTheDocument();
    expect(
      screen.getByText("노래를 신청하고 GROOVE에 참여하세요!"),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "노래 신청하기" }),
    ).not.toBeInTheDocument();
  });

  it("shows the closed notice after the application ends", () => {
    renderAtPhase("after");

    expect(screen.getByText("신청이 마감되었어요")).toBeInTheDocument();
    expect(
      screen.getByText("최종 플레이리스트는 축제 기간에 공개됩니다"),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "노래 신청하기" }),
    ).not.toBeInTheDocument();
  });
});
