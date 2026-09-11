import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { AxiosError, AxiosHeaders } from "axios";
import type { ReactNode } from "react";

import { httpClient } from "@/shared/api";

import { SongRequestForm } from "./SongRequestForm";

vi.mock("@/shared/api", async () => {
  const actual = await vi.importActual<Record<string, unknown>>("@/shared/api");
  return { ...actual, httpClient: { get: vi.fn(), post: vi.fn() } };
});

const httpGet = vi.mocked(httpClient.get);
const httpPost = vi.mocked(httpClient.post);

const envelope = (data: unknown) => ({
  data: { success: true, data, error: null },
  status: 200,
});

const errorResponse = (code: string, status: number) => {
  const axiosError = new AxiosError(code, "ERR_BAD_RESPONSE");
  axiosError.response = {
    data: { success: false, data: null, error: { code, message: code } },
    status,
    statusText: "",
    headers: {},
    config: { headers: new AxiosHeaders() },
  };
  return axiosError;
};

const track = {
  trackId: "1234567890",
  title: "Ditto",
  artist: "NewJeans",
  albumCoverUrl: "https://x/1",
};

const renderForm = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  return render(<SongRequestForm />, { wrapper });
};

const searchAndSelect = async () => {
  fireEvent.change(screen.getByLabelText(/음악 검색/), { target: { value: "ditto" } });
  fireEvent.click(screen.getByRole("button", { name: "검색" }));
  fireEvent.click(await screen.findByRole("button", { name: /Ditto/ }));
};

const fillDetails = (studentId: string) => {
  fireEvent.change(screen.getByLabelText("학번"), { target: { value: studentId } });
  fireEvent.change(screen.getByLabelText("학과"), { target: { value: "컴퓨터학부" } });
  fireEvent.change(screen.getByLabelText("이름"), { target: { value: "김그루브" } });
  fireEvent.change(screen.getByLabelText("닉네임"), { target: { value: "gv" } });
};

const submit = () => fireEvent.click(screen.getByRole("button", { name: "신청하기" }));

afterEach(() => {
  vi.clearAllMocks();
});

describe("SongRequestForm", () => {
  it("blocks submission and asks to pick a track when nothing is selected", async () => {
    renderForm();

    submit();

    expect(await screen.findByText("곡을 검색해서 선택해 주세요.")).toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("shows a search-service message when the search request fails", async () => {
    httpGet.mockRejectedValueOnce(errorResponse("PLST005", 502));
    renderForm();

    fireEvent.change(screen.getByLabelText(/음악 검색/), { target: { value: "x" } });
    fireEvent.click(screen.getByRole("button", { name: "검색" }));

    expect(
      await screen.findByText(
        "곡 검색 서비스에 문제가 생겼어요. 잠시 후 다시 시도해 주세요.",
      ),
    ).toBeInTheDocument();
  });

  it("shows the student-id message when the id is not 10 digits", async () => {
    httpGet.mockResolvedValueOnce(envelope({ tracks: [track] }));
    renderForm();
    await searchAndSelect();
    fillDetails("202500");

    submit();

    expect(
      await screen.findByText("학번을 숫자 10자리로 입력해 주세요."),
    ).toBeInTheDocument();
    expect(httpPost).not.toHaveBeenCalled();
  });

  it("submits the selected track and opens the completion popup", async () => {
    httpGet.mockResolvedValueOnce(envelope({ tracks: [track] }));
    httpPost.mockResolvedValueOnce(
      envelope({
        songRequestId: 5,
        trackId: track.trackId,
        title: "Ditto",
        artist: "NewJeans",
        albumCoverUrl: "https://x/1",
        college: "IT",
        department: "컴퓨터학부",
        nickname: "gv",
        requestedAt: "2026-09-12T10:00:00+09:00",
        updatedAt: "2026-09-12T10:00:00+09:00",
      }),
    );
    renderForm();
    await searchAndSelect();
    fillDetails("3025000001");

    submit();

    const dialog = await screen.findByRole("dialog");
    expect(dialog).toHaveAccessibleName(/신청이 완료되었어요/);
    const [, body, config] = httpPost.mock.calls[0] as [
      string,
      Record<string, unknown>,
      { headers?: Record<string, string> },
    ];
    expect(body).toMatchObject({ trackId: track.trackId, college: "IT" });
    expect(config.headers?.["Idempotency-Key"]).toEqual(expect.any(String));
  });

  it("maps the rate-limit error to a friendly message", async () => {
    httpGet.mockResolvedValueOnce(envelope({ tracks: [track] }));
    httpPost.mockRejectedValueOnce(errorResponse("PLST009", 429));
    renderForm();
    await searchAndSelect();
    fillDetails("3025000002");

    submit();

    expect(
      await screen.findByText(
        "신청이 몰려 잠시 제한됐어요. 잠시 후 다시 시도해 주세요.",
      ),
    ).toBeInTheDocument();
  });

  it("closes the results dropdown when clicking outside it", async () => {
    httpGet.mockResolvedValueOnce(envelope({ tracks: [track] }));
    renderForm();

    fireEvent.change(screen.getByLabelText(/음악 검색/), {
      target: { value: "ditto" },
    });
    fireEvent.click(screen.getByRole("button", { name: "검색" }));
    await screen.findByRole("button", { name: /Ditto/ });

    fireEvent.mouseDown(document.body);

    expect(screen.queryByRole("button", { name: /Ditto/ })).not.toBeInTheDocument();
  });

  it("clears the form after 확인 on the completion popup", async () => {
    httpGet.mockResolvedValueOnce(envelope({ tracks: [track] }));
    httpPost.mockResolvedValueOnce(
      envelope({
        songRequestId: 6,
        trackId: track.trackId,
        title: "Ditto",
        artist: "NewJeans",
        college: "IT",
        department: "컴퓨터학부",
        nickname: "gv",
        requestedAt: "2026-09-12T10:00:00+09:00",
        updatedAt: "2026-09-12T10:00:00+09:00",
      }),
    );
    renderForm();
    await searchAndSelect();
    fillDetails("3025000003");
    submit();
    await screen.findByRole("dialog");

    fireEvent.click(screen.getByRole("button", { name: "확인" }));

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
    expect(screen.getByLabelText("이름")).toHaveValue("");
    expect(screen.getByLabelText(/음악 검색/)).toHaveValue("");
  });
});
