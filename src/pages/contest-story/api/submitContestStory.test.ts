import { AxiosError, AxiosHeaders } from "axios";

import { httpClient } from "@/shared/api";

import { submitContestStory, toSubmitContestStoryBody } from "./submitContestStory";

vi.mock("@/shared/api", async () => {
  const actual = await vi.importActual<Record<string, unknown>>("@/shared/api");
  return { ...actual, httpClient: { post: vi.fn() } };
});

const httpPost = vi.mocked(httpClient.post);

const formValues = {
  college: "간호" as const,
  department: " 간호학과 ",
  studentNumber: " 20241234 ",
  name: " 김그루브 ",
  nickname: " ",
  title: " 축제 이야기 ",
  content: " 함께 노래해요. ",
  termsAgreed: true,
  personalInfoCollectionAgreed: true,
};

afterEach(() => {
  vi.clearAllMocks();
});

describe("toSubmitContestStoryBody", () => {
  it("trims fields and maps the college label to the API enum", () => {
    expect(toSubmitContestStoryBody(formValues)).toEqual({
      college: "NURSING",
      department: "간호학과",
      studentNumber: "20241234",
      name: "김그루브",
      nickname: null,
      title: "축제 이야기",
      content: "함께 노래해요.",
    });
  });
});

describe("submitContestStory", () => {
  it("posts the story body and unwraps the result", async () => {
    const body = toSubmitContestStoryBody(formValues);
    const responseBody = {
      storyId: 7,
      title: "축제 이야기",
      nickname: null,
      college: "NURSING" as const,
      submittedAt: "2026-09-22T10:00:00+09:00",
      updatedAt: "2026-09-22T10:00:00+09:00",
    };
    httpPost.mockResolvedValueOnce({
      data: { success: true, data: responseBody, error: null },
      status: 200,
    });

    await expect(submitContestStory(body)).resolves.toEqual(responseBody);
    expect(httpPost).toHaveBeenCalledWith("/contest/stories", body);
  });

  it("surfaces the closed collection code as an ApiError", async () => {
    const axiosError = new AxiosError("forbidden", "ERR_BAD_REQUEST");
    axiosError.response = {
      data: {
        success: false,
        data: null,
        error: { code: "SING003", message: "closed" },
      },
      status: 403,
      statusText: "",
      headers: {},
      config: { headers: new AxiosHeaders() },
    };
    httpPost.mockRejectedValueOnce(axiosError);

    await expect(
      submitContestStory(toSubmitContestStoryBody(formValues)),
    ).rejects.toThrowError(expect.objectContaining({ code: "SING003", status: 403 }));
  });
});
