import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import type { ReactNode } from "react";

import { httpClient } from "@/shared/api";

import { PlanAdminDashboard } from "./PlanAdminDashboard";

vi.mock("@/shared/api", async () => {
  const actual = await vi.importActual<Record<string, unknown>>("@/shared/api");
  return { ...actual, httpClient: { get: vi.fn(), post: vi.fn() } };
});

const httpGet = vi.mocked(httpClient.get);
const httpPost = vi.mocked(httpClient.post);
const ok = (data: unknown) => ({
  data: { success: true, data, error: null },
  status: 200,
});

const scoreboard = {
  scores: [
    { college: "IT", collegeName: "IT대학", score: 300, rank: 1 },
    { college: "NURSING", collegeName: "간호대학", score: 120, rank: 2 },
  ],
  updatedAt: null,
};

const renderDashboard = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return render(<PlanAdminDashboard />, { wrapper });
};

beforeEach(() => {
  httpGet.mockResolvedValue(ok(scoreboard));
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("PlanAdminDashboard", () => {
  it("shows the current RIVALS scoreboard", async () => {
    renderDashboard();

    const board = await screen.findByRole("region", { name: "RIVALS 점수판" });
    expect(await within(board).findByText("IT대학")).toBeInTheDocument();
    expect(within(board).getByText("300점")).toBeInTheDocument();
    expect(httpGet).toHaveBeenCalledWith("/rivals/scores");
  });

  it("adds points to the chosen college after confirmation", async () => {
    httpPost.mockResolvedValueOnce(ok({ college: "NURSING", score: 170 }));
    renderDashboard();
    await screen.findAllByText("300점");

    const submit = screen.getByRole("button", { name: "점수 반영" });
    expect(submit).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: /간호대학/ }));
    fireEvent.click(screen.getByRole("button", { name: "+50" }));
    fireEvent.change(screen.getByPlaceholderText("예: 1차 미션 1위"), {
      target: { value: "1차 미션" },
    });
    fireEvent.click(submit);
    expect(
      screen.getByText(/간호대학에 \+50점 \(1차 미션\)을 반영해요/),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "반영" }));

    await waitFor(() =>
      expect(httpPost).toHaveBeenCalledWith("/admin/plan/rivals/scores", {
        college: "NURSING",
        points: 50,
        reason: "1차 미션",
      }),
    );
    expect(
      await screen.findByText("간호대학 +50점 반영 → 현재 170점"),
    ).toBeInTheDocument();
  });

  it("subtracts points to fix a wrong entry", async () => {
    httpPost.mockResolvedValueOnce(ok({ college: "IT", score: 250 }));
    renderDashboard();
    await screen.findAllByText("300점");

    fireEvent.click(screen.getByRole("button", { name: /IT대학/ }));
    fireEvent.change(screen.getByPlaceholderText("예: 50"), {
      target: { value: "50" },
    });
    fireEvent.click(screen.getByRole("button", { name: "± 부호 바꾸기" }));
    fireEvent.click(screen.getByRole("button", { name: "점수 반영" }));
    fireEvent.click(screen.getByRole("button", { name: "반영" }));

    await waitFor(() =>
      expect(httpPost).toHaveBeenCalledWith("/admin/plan/rivals/scores", {
        college: "IT",
        points: -50,
        reason: null,
      }),
    );
  });
});
