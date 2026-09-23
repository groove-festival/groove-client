import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";

import { httpClient } from "@/shared/api";

import { StageStoryModerationList } from "./StageStoryModerationList";

vi.mock("@/shared/api", async () => {
  const actual = await vi.importActual<Record<string, unknown>>("@/shared/api");
  return { ...actual, httpClient: { get: vi.fn(), delete: vi.fn() } };
});

const httpGet = vi.mocked(httpClient.get);
const httpDelete = vi.mocked(httpClient.delete);

const story = {
  storySubmissionId: 1,
  college: "IT",
  department: "컴퓨터학부",
  studentNumber: "2025000123",
  name: "김그루브",
  nickname: "gv",
  title: "축제 이야기",
  content: "함께 노래해요.",
  submittedAt: "2026-09-25T10:00:00+09:00",
};

const renderList = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return render(<StageStoryModerationList />, { wrapper });
};

afterEach(() => {
  vi.clearAllMocks();
});

describe("StageStoryModerationList", () => {
  it("lists stories and deletes one after confirming", async () => {
    httpGet.mockResolvedValueOnce({
      data: { success: true, data: [story], error: null },
      status: 200,
    });
    httpDelete.mockResolvedValueOnce({
      data: { success: true, data: {}, error: null },
      status: 200,
    });
    renderList();

    expect(await screen.findByText("축제 이야기")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "삭제" }));
    expect(screen.getByRole("dialog")).toHaveTextContent("사연을 삭제할까요?");
    fireEvent.click(screen.getByRole("button", { name: "확인" }));

    await waitFor(() =>
      expect(httpDelete).toHaveBeenCalledWith("/admin/stage/stories/1"),
    );
  });

  it("shows the empty state when there are no stories", async () => {
    httpGet.mockResolvedValueOnce({
      data: { success: true, data: [], error: null },
      status: 200,
    });
    renderList();

    expect(await screen.findByText("접수된 사연이 없어요.")).toBeInTheDocument();
  });
});
