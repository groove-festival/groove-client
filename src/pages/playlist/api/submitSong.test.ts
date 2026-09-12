import { AxiosError, AxiosHeaders } from "axios";

import { httpClient } from "@/shared/api";

import { submitSong, toSubmitSongBody } from "./submitSong";

vi.mock("@/shared/api", async () => {
  const actual = await vi.importActual<Record<string, unknown>>("@/shared/api");
  return { ...actual, httpClient: { post: vi.fn() } };
});

const httpPost = vi.mocked(httpClient.post);

const formValues = {
  trackId: "1234567890",
  college: "간호" as const,
  studentId: "2025000123",
  department: "간호학과",
  name: "김그루브",
  nickname: "gv",
};

afterEach(() => {
  vi.clearAllMocks();
});

describe("toSubmitSongBody", () => {
  it("maps form values to the request body and translates the college label", () => {
    expect(toSubmitSongBody(formValues)).toEqual({
      studentNumber: "2025000123",
      name: "김그루브",
      trackId: "1234567890",
      college: "NURSING",
      department: "간호학과",
      nickname: "gv",
    });
  });
});

describe("submitSong", () => {
  it("sends the body with the Idempotency-Key header and unwraps the result", async () => {
    const responseBody = {
      songRequestId: 12,
      trackId: "1234567890",
      title: "Ditto",
      artist: "NewJeans",
      albumCoverUrl: "https://x/1",
      college: "NURSING",
      department: "간호학과",
      nickname: "gv",
      requestedAt: "2026-09-12T10:30:00+09:00",
      updatedAt: "2026-09-12T10:30:00+09:00",
    };
    httpPost.mockResolvedValueOnce({
      data: { success: true, data: responseBody, error: null },
      status: 200,
    });

    const body = toSubmitSongBody(formValues);
    await expect(submitSong({ body, idempotencyKey: "key-1" })).resolves.toEqual(
      responseBody,
    );
    expect(httpPost).toHaveBeenCalledWith("/playlist/songs", body, {
      headers: { "Idempotency-Key": "key-1" },
    });
  });

  it("surfaces the rate-limit code (PLST009) as an ApiError", async () => {
    const axiosError = new AxiosError("too many", "ERR_BAD_REQUEST");
    axiosError.response = {
      data: { success: false, data: null, error: { code: "PLST009", message: "한도" } },
      status: 429,
      statusText: "",
      headers: {},
      config: { headers: new AxiosHeaders() },
    };
    httpPost.mockRejectedValueOnce(axiosError);

    await expect(
      submitSong({ body: toSubmitSongBody(formValues), idempotencyKey: "key-2" }),
    ).rejects.toThrowError(expect.objectContaining({ code: "PLST009", status: 429 }));
  });
});
