import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";

import {
  SONG_REQUEST_CLOSES_AT,
  SONG_REQUEST_OPENS_AT,
} from "../model/playlistSchedule";
import PlaylistPage from "./PlaylistPage";

const renderAt = (path: string) => {
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

const renderAtPhase = (phase?: string) => renderAt(phase ? `/?phase=${phase}` : "/");

describe("PlaylistPage", () => {
  it("renders the shared festival hero", () => {
    renderAtPhase("during");

    expect(
      screen.getByRole("heading", { name: "GROOVE FESTIVAL" }),
    ).toBeInTheDocument();
  });

  it("shows the song request form during the application phase", () => {
    renderAtPhase("during");

    expect(screen.getByRole("heading", { name: "노래 신청하기" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "신청하기" })).toBeInTheDocument();
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

  it("shows the countdown when the phase override is 'before'", () => {
    renderAtPhase("before");

    expect(screen.getByText("COUNTDOWN")).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "노래 신청하기" }),
    ).not.toBeInTheDocument();
  });

  it("shows the closed notice when the phase override is 'after'", () => {
    renderAtPhase("after");

    expect(screen.getByText("신청이 마감되었어요")).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "노래 신청하기" }),
    ).not.toBeInTheDocument();
  });

  describe("without a phase override, the schedule decides", () => {
    beforeEach(() => {
      vi.useFakeTimers({ toFake: ["Date"] });
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("shows the countdown before the open time", () => {
      vi.setSystemTime(new Date(SONG_REQUEST_OPENS_AT.getTime() - 1000));
      renderAt("/");

      expect(screen.getByText("COUNTDOWN")).toBeInTheDocument();
    });

    it("shows the song request form within the application window", () => {
      vi.setSystemTime(SONG_REQUEST_OPENS_AT);
      renderAt("/");

      expect(
        screen.getByRole("heading", { name: "노래 신청하기" }),
      ).toBeInTheDocument();
    });

    it("shows the closed notice after the close time", () => {
      vi.setSystemTime(SONG_REQUEST_CLOSES_AT);
      renderAt("/");

      expect(screen.getByText("신청이 마감되었어요")).toBeInTheDocument();
    });
  });
});
