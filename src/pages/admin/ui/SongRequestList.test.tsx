import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import type { ReactNode } from "react";

import { httpClient } from "@/shared/api";

import { SongRequestList } from "./SongRequestList";

vi.mock("@/shared/api", async () => {
  const actual = await vi.importActual<Record<string, unknown>>("@/shared/api");
  return {
    ...actual,
    httpClient: { get: vi.fn(), patch: vi.fn(), delete: vi.fn() },
  };
});

const httpGet = vi.mocked(httpClient.get);
const httpPatch = vi.mocked(httpClient.patch);
const httpDelete = vi.mocked(httpClient.delete);

const song = {
  songRequestId: 12,
  title: "Super Shy",
  artist: "NewJeans",
  trackId: "1",
  nickname: "그루브러버",
  name: "이상민",
  studentNumber: "2021123456",
  college: "IT",
  department: "컴퓨터학부",
  selected: false,
  requestedAt: "2026-09-12T10:30:00+09:00",
  updatedAt: "2026-09-14T21:05:00+09:00",
};

const list = {
  totalCount: 1,
  selectedCount: 0,
  groups: [{ college: "IT", collegeName: "IT융합대학", count: 1, songs: [song] }],
};

const renderList = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return render(<SongRequestList />, { wrapper });
};

afterEach(() => {
  vi.clearAllMocks();
});

describe("SongRequestList", () => {
  it("renders each college group with the private applicant info", async () => {
    httpGet.mockResolvedValueOnce({
      data: { success: true, data: list, error: null },
      status: 200,
    });
    renderList();

    expect(await screen.findByText("IT융합대학 (1)")).toBeInTheDocument();
    expect(screen.getByText("Super Shy")).toBeInTheDocument();
    expect(screen.getByText("이상민 · 2021123456 · 컴퓨터학부")).toBeInTheDocument();
  });

  it("toggles selection with the inverted flag", async () => {
    httpGet.mockResolvedValueOnce({
      data: { success: true, data: list, error: null },
      status: 200,
    });
    httpPatch.mockResolvedValueOnce({
      data: { success: true, data: { ...song, selected: true }, error: null },
      status: 200,
    });
    renderList();

    fireEvent.click(await screen.findByRole("button", { name: "선정" }));

    await waitFor(() =>
      expect(httpPatch).toHaveBeenCalledWith("/admin/promo/songs/12/selection", {
        selected: true,
      }),
    );
  });

  it("deletes a request only after confirmation", async () => {
    httpGet.mockResolvedValueOnce({
      data: { success: true, data: list, error: null },
      status: 200,
    });
    httpDelete.mockResolvedValueOnce({
      data: { success: true, data: {}, error: null },
      status: 200,
    });
    renderList();

    fireEvent.click(await screen.findByRole("button", { name: "삭제" }));
    expect(httpDelete).not.toHaveBeenCalled();

    const dialog = screen.getByRole("dialog");
    fireEvent.click(within(dialog).getByRole("button", { name: "삭제" }));

    await waitFor(() =>
      expect(httpDelete).toHaveBeenCalledWith("/admin/promo/songs/12"),
    );
  });
});
