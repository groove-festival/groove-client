import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";

import { httpClient } from "@/shared/api";

import { DisplayOrderEditor } from "./DisplayOrderEditor";

vi.mock("@/shared/api", async () => {
  const actual = await vi.importActual<Record<string, unknown>>("@/shared/api");
  return { ...actual, httpClient: { get: vi.fn(), put: vi.fn() } };
});

const httpGet = vi.mocked(httpClient.get);
const httpPut = vi.mocked(httpClient.put);

const baseSong = {
  artist: "a",
  trackId: "t",
  nickname: "nick",
  name: "n",
  studentNumber: "s",
  college: "IT",
  department: "d",
  requestedAt: "2026-09-12T10:00:00+09:00",
  updatedAt: "2026-09-12T10:00:00+09:00",
};

const list = {
  totalCount: 3,
  selectedCount: 2,
  groups: [
    {
      college: "IT",
      collegeName: "IT융합대학",
      count: 3,
      songs: [
        {
          ...baseSong,
          songRequestId: 1,
          title: "First",
          selected: true,
          displayOrder: 1,
        },
        {
          ...baseSong,
          songRequestId: 2,
          title: "Second",
          selected: true,
          displayOrder: 2,
        },
        { ...baseSong, songRequestId: 3, title: "Nope", selected: false },
      ],
    },
  ],
};

const renderEditor = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return render(<DisplayOrderEditor />, { wrapper });
};

afterEach(() => {
  vi.clearAllMocks();
});

describe("DisplayOrderEditor", () => {
  it("lists only selected songs in display order", async () => {
    httpGet.mockResolvedValueOnce({
      data: { success: true, data: list, error: null },
      status: 200,
    });
    renderEditor();

    expect(await screen.findByText("선정 2곡")).toBeInTheDocument();
    const items = screen.getAllByRole("listitem");
    expect(items[0]).toHaveTextContent("First");
    expect(items[1]).toHaveTextContent("Second");
    expect(screen.queryByText("Nope")).not.toBeInTheDocument();
  });

  it("keeps save disabled until the order actually changes", async () => {
    httpGet.mockResolvedValueOnce({
      data: { success: true, data: list, error: null },
      status: 200,
    });
    renderEditor();

    const save = await screen.findByRole("button", { name: "순서 저장" });
    expect(save).toBeDisabled();

    fireEvent.click(screen.getAllByRole("button", { name: "아래로" })[0]);
    expect(save).toBeEnabled();
  });

  it("sends the full reordered id list", async () => {
    httpGet.mockResolvedValueOnce({
      data: { success: true, data: list, error: null },
      status: 200,
    });
    httpPut.mockResolvedValueOnce({
      data: { success: true, data: { totalCount: 2, songs: [] }, error: null },
      status: 200,
    });
    renderEditor();

    fireEvent.click((await screen.findAllByRole("button", { name: "아래로" }))[0]);
    fireEvent.click(screen.getByRole("button", { name: "순서 저장" }));

    await waitFor(() =>
      expect(httpPut).toHaveBeenCalledWith("/admin/promo/songs/display-order", {
        songRequestIds: [2, 1],
      }),
    );
  });
});
