import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";

import {
  type FestivalStatusResponseBody,
  useFestivalStatus,
} from "@/entities/festival";

import PlaylistPage from "./PlaylistPage";

vi.mock("@/entities/festival", async () => {
  const actual = await vi.importActual<Record<string, unknown>>("@/entities/festival");
  return { ...actual, useFestivalStatus: vi.fn() };
});

const useFestivalStatusMock = vi.mocked(useFestivalStatus);
const refetch = vi.fn();

type StatusQuery = ReturnType<typeof useFestivalStatus>;

const buildStatus = (
  phase: FestivalStatusResponseBody["playlist"]["phase"],
): FestivalStatusResponseBody => ({
  phase: "BEFORE",
  festivalStartAt: "2026-10-01T00:00:00+09:00",
  festivalEndAt: "2026-10-03T00:00:00+09:00",
  storyCollectionOpen: false,
  playlist: {
    phase,
    submissionStartAt: "2026-09-12T00:00:00+09:00",
    submissionEndAt: "2026-09-17T00:00:00+09:00",
    publishAt: "2026-10-01T00:00:00+09:00",
  },
});

const mockStatus = (value: Partial<StatusQuery>) => {
  useFestivalStatusMock.mockReturnValue({
    data: undefined,
    isPending: false,
    isError: false,
    refetch,
    ...value,
  } as StatusQuery);
};

const renderPage = (path = "/") => {
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

afterEach(() => {
  vi.clearAllMocks();
});

describe("PlaylistPage", () => {
  it("renders the shared festival hero", () => {
    mockStatus({ data: buildStatus("SUBMISSION") });
    renderPage();

    expect(
      screen.getByRole("heading", { name: "GROOVE FESTIVAL" }),
    ).toBeInTheDocument();
  });

  it("shows the countdown during BEFORE_OPEN", () => {
    mockStatus({ data: buildStatus("BEFORE_OPEN") });
    renderPage();

    expect(screen.getByText("COUNTDOWN")).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "노래 신청하기" }),
    ).not.toBeInTheDocument();
  });

  it("shows the song request form during SUBMISSION", () => {
    mockStatus({ data: buildStatus("SUBMISSION") });
    renderPage();

    expect(screen.getByRole("heading", { name: "노래 신청하기" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "신청하기" })).toBeInTheDocument();
  });

  it("shows the closed notice during SELECTION", () => {
    mockStatus({ data: buildStatus("SELECTION") });
    renderPage();

    expect(screen.getByText("신청이 마감되었어요")).toBeInTheDocument();
  });

  it("shows the published notice and the playlist CTA during PUBLISHED", () => {
    mockStatus({ data: buildStatus("PUBLISHED") });
    renderPage();

    expect(screen.getByText("최종 플레이리스트가 공개됐어요")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "GROOVE PLAYLIST 보러가기" }),
    ).toBeInTheDocument();
  });

  it("lets a ?phase override win over the fetched status", () => {
    mockStatus({ data: buildStatus("BEFORE_OPEN") });
    renderPage("/?phase=submission");

    expect(screen.getByRole("heading", { name: "노래 신청하기" })).toBeInTheDocument();
  });

  it("offers a retry when the status request fails", () => {
    mockStatus({ isError: true });
    renderPage();

    expect(screen.getByText("축제 정보를 불러오지 못했어요")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "다시 시도" })).toBeInTheDocument();
  });

  it("offers a retry when status succeeds without playlist phase info", () => {
    // 계약 불일치(예: 구버전 백엔드 응답)로 playlist가 비어 있는 경우. 빈
    // 화면을 남기지 않고 안내한다.
    mockStatus({
      data: {
        phase: "BEFORE",
        festivalStartAt: "2026-10-01T00:00:00+09:00",
        festivalEndAt: "2026-10-03T00:00:00+09:00",
        storyCollectionOpen: false,
      } as FestivalStatusResponseBody,
    });
    renderPage();

    expect(screen.getByText("축제 정보를 불러오지 못했어요")).toBeInTheDocument();
  });
});
