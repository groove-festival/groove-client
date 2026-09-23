import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { AxiosError, AxiosHeaders } from "axios";
import type { ReactNode } from "react";

import { httpClient } from "@/shared/api";

import { SongRequestForm } from "./SongRequestForm";

const { trackPlaylistEventMock } = vi.hoisted(() => ({
  trackPlaylistEventMock: vi.fn(),
}));

vi.mock("@/shared/api", async () => {
  const actual = await vi.importActual<Record<string, unknown>>("@/shared/api");
  return { ...actual, httpClient: { get: vi.fn(), post: vi.fn() } };
});

vi.mock("../model/playlistTelemetry", async () => {
  const actual = await vi.importActual<Record<string, unknown>>(
    "../model/playlistTelemetry",
  );
  return { ...actual, trackPlaylistEvent: trackPlaylistEventMock };
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

const agreeToRequiredPolicies = () => {
  fireEvent.click(
    screen.getByRole("checkbox", {
      name: /GROOVE 웹서비스 이용약관에 동의합니다/,
    }),
  );
  fireEvent.click(
    screen.getByRole("checkbox", {
      name: /개인정보 수집 및 이용에 동의합니다/,
    }),
  );
};

const submit = () => fireEvent.click(screen.getByRole("button", { name: "신청하기" }));

afterEach(() => {
  vi.clearAllMocks();
});

describe("SongRequestForm", () => {
  it("blocks submission and asks to pick a track when nothing is selected", async () => {
    renderForm();
    agreeToRequiredPolicies();

    submit();

    expect(await screen.findByText("곡을 검색해서 선택해 주세요.")).toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("explains how the nickname is displayed", () => {
    renderForm();

    expect(
      screen.getByText("* 닉네임은 플레이리스트에서 신청자명 대신 보여질 이름입니다."),
    ).toBeInTheDocument();
  });

  it("shows the required agreement links and enables submission only after both are checked", () => {
    renderForm();

    const submitButton = screen.getByRole("button", { name: "신청하기" });
    const terms = screen.getByRole("checkbox", {
      name: /GROOVE 웹서비스 이용약관에 동의합니다/,
    });
    const personalInfoCollection = screen.getByRole("checkbox", {
      name: /개인정보 수집 및 이용에 동의합니다/,
    });

    expect(submitButton).toBeDisabled();
    expect(screen.getByRole("link", { name: "약관 전문 보기" })).toHaveAttribute(
      "href",
      "https://knu-cse-sysdev.notion.site/festival-terms-of-services",
    );
    expect(screen.getByRole("link", { name: "동의서 전문 보기" })).toHaveAttribute(
      "href",
      "https://knu-cse-sysdev.notion.site/festival-personal-information-collection-and-use-consent",
    );

    fireEvent.click(terms);
    expect(submitButton).toBeDisabled();

    fireEvent.click(personalInfoCollection);
    expect(submitButton).toBeEnabled();
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
    expect(trackPlaylistEventMock).toHaveBeenCalledWith(
      expect.objectContaining({
        error_code: "PLST005",
        eventName: "song_search_failure",
      }),
    );
  });

  it("keeps the search label and shows the interaction overlay while searching", async () => {
    let resolveSearch!: (value: ReturnType<typeof envelope>) => void;
    httpGet.mockReturnValueOnce(
      new Promise<ReturnType<typeof envelope>>((resolve) => {
        resolveSearch = resolve;
      }),
    );
    renderForm();

    fireEvent.change(screen.getByLabelText(/음악 검색/), { target: { value: "x" } });
    fireEvent.click(screen.getByRole("button", { name: "검색" }));

    expect(screen.getByRole("button", { name: "검색" })).toBeDisabled();
    expect(
      await screen.findByRole("status", { name: "곡을 검색하는 중입니다" }),
    ).toBeInTheDocument();

    await act(async () => {
      resolveSearch(envelope({ tracks: [] }));
    });

    await waitFor(() => {
      expect(
        screen.queryByRole("status", { name: "곡을 검색하는 중입니다" }),
      ).not.toBeInTheDocument();
    });
  });

  it("shows the student-id message when the id is not 10 digits", async () => {
    httpGet.mockResolvedValueOnce(envelope({ tracks: [track] }));
    renderForm();
    await searchAndSelect();
    fillDetails("202500");
    agreeToRequiredPolicies();

    submit();

    expect(
      await screen.findByText("학번을 숫자 10자리로 입력해 주세요."),
    ).toBeInTheDocument();
    expect(httpPost).not.toHaveBeenCalled();
    expect(trackPlaylistEventMock).toHaveBeenCalledWith({
      eventName: "playlist_form_validation_failure",
      validation_field: "studentId",
    });
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
    agreeToRequiredPolicies();

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
    expect(trackPlaylistEventMock).toHaveBeenCalledWith({
      eventName: "playlist_form_view",
    });
    expect(trackPlaylistEventMock).toHaveBeenCalledWith({
      eventName: "playlist_form_start",
    });
    expect(trackPlaylistEventMock).toHaveBeenCalledWith({
      eventName: "song_search_attempt",
    });
    expect(trackPlaylistEventMock).toHaveBeenCalledWith(
      expect.objectContaining({
        eventName: "song_search_success",
        result_count_bucket: "1_to_5",
      }),
    );
    expect(trackPlaylistEventMock).toHaveBeenCalledWith({ eventName: "song_select" });
    expect(trackPlaylistEventMock).toHaveBeenCalledWith({
      eventName: "song_submit_attempt",
    });
    expect(trackPlaylistEventMock).toHaveBeenCalledWith(
      expect.objectContaining({ eventName: "song_submit_success" }),
    );

    const telemetryPayload = JSON.stringify(trackPlaylistEventMock.mock.calls);
    expect(telemetryPayload).not.toContain("ditto");
    expect(telemetryPayload).not.toContain("Ditto");
    expect(telemetryPayload).not.toContain("NewJeans");
    expect(telemetryPayload).not.toContain(track.trackId);
    expect(telemetryPayload).not.toContain("3025000001");
    expect(telemetryPayload).not.toContain("김그루브");
  });

  it("shows the interaction overlay while submitting the selected track", async () => {
    let resolveSubmit!: (value: ReturnType<typeof envelope>) => void;
    httpGet.mockResolvedValueOnce(envelope({ tracks: [track] }));
    httpPost.mockReturnValueOnce(
      new Promise<ReturnType<typeof envelope>>((resolve) => {
        resolveSubmit = resolve;
      }),
    );
    renderForm();
    await searchAndSelect();
    fillDetails("3025000005");
    agreeToRequiredPolicies();

    submit();

    expect(
      await screen.findByRole("status", { name: "신청을 처리하는 중입니다" }),
    ).toBeInTheDocument();

    await act(async () => {
      resolveSubmit(
        envelope({
          songRequestId: 7,
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
    });

    await waitFor(() => {
      expect(
        screen.queryByRole("status", { name: "신청을 처리하는 중입니다" }),
      ).not.toBeInTheDocument();
    });
  });

  it("maps the rate-limit error to a friendly message", async () => {
    httpGet.mockResolvedValueOnce(envelope({ tracks: [track] }));
    httpPost.mockRejectedValueOnce(errorResponse("PLST009", 429));
    renderForm();
    await searchAndSelect();
    fillDetails("3025000002");
    agreeToRequiredPolicies();

    submit();

    expect(
      await screen.findByText(
        "신청이 몰려 잠시 제한됐어요. 잠시 후 다시 시도해 주세요.",
      ),
    ).toBeInTheDocument();
    expect(trackPlaylistEventMock).toHaveBeenCalledWith(
      expect.objectContaining({
        error_code: "PLST009",
        eventName: "song_submit_failure",
      }),
    );
  });

  it("maps the taken-track error to a friendly message", async () => {
    httpGet.mockResolvedValueOnce(envelope({ tracks: [track] }));
    httpPost.mockRejectedValueOnce(errorResponse("PLST010", 409));
    renderForm();
    await searchAndSelect();
    fillDetails("3025000004");
    agreeToRequiredPolicies();

    submit();

    expect(
      await screen.findByText(
        "이미 다른 사람이 신청한 곡입니다. 다른 곡을 선택해주세요.",
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
    agreeToRequiredPolicies();
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
