import { AxiosError, AxiosHeaders, type AxiosResponse } from "axios";

import { ApiError, requestData, toApiError, unwrap, type ApiEnvelope } from "./unwrap";

const responseWith = <T>(
  body: ApiEnvelope<T>,
  status = 200,
): AxiosResponse<ApiEnvelope<T>> => ({
  data: body,
  status,
  statusText: "",
  headers: {},
  config: { headers: new AxiosHeaders() },
});

describe("unwrap", () => {
  it("returns the application data from a success envelope", () => {
    const response = responseWith({
      success: true,
      data: { value: 42 },
      error: null,
    });

    expect(unwrap(response)).toEqual({ value: 42 });
  });

  it("throws an ApiError carrying the envelope error code on success:false", () => {
    const response = responseWith(
      { success: false, data: null, error: { code: "PLST001", message: "접수 아님" } },
      403,
    );

    expect(() => unwrap(response)).toThrowError(
      expect.objectContaining({ code: "PLST001", status: 403 }),
    );
  });

  it("throws an ApiError when data is missing without an error block", () => {
    const response = responseWith({ success: true, data: null, error: null });

    expect(() => unwrap(response)).toThrowError(
      expect.objectContaining({ code: "UNKNOWN" }),
    );
  });
});

describe("toApiError", () => {
  it("passes an existing ApiError through untouched", () => {
    const original = new ApiError("PLST009", "한도 초과", 429);

    expect(toApiError(original)).toBe(original);
  });

  it("reads code and status from an axios error envelope", () => {
    const axiosError = new AxiosError("Request failed", "ERR_BAD_REQUEST");
    axiosError.response = responseWith(
      { success: false, data: null, error: { code: "PLST005", message: "외부 장애" } },
      502,
    );

    const normalized = toApiError(axiosError);

    expect(normalized).toBeInstanceOf(ApiError);
    expect(normalized.code).toBe("PLST005");
    expect(normalized.status).toBe(502);
  });

  it("falls back to a NETWORK code when there is no response body", () => {
    const axiosError = new AxiosError("Network Error", "ERR_NETWORK");

    expect(toApiError(axiosError).code).toBe("NETWORK");
  });

  it("wraps a non-axios throw as an UNKNOWN ApiError", () => {
    expect(toApiError(new Error("boom")).code).toBe("UNKNOWN");
  });
});

describe("requestData", () => {
  it("unwraps a resolved envelope response", async () => {
    await expect(
      requestData(async () =>
        responseWith({ success: true, data: [1, 2, 3], error: null }),
      ),
    ).resolves.toEqual([1, 2, 3]);
  });

  it("normalizes a rejected request into an ApiError", async () => {
    const axiosError = new AxiosError("boom", "ERR_BAD_RESPONSE");
    axiosError.response = responseWith(
      { success: false, data: null, error: { code: "C001", message: "누락" } },
      400,
    );

    await expect(
      requestData(async () => {
        throw axiosError;
      }),
    ).rejects.toThrowError(expect.objectContaining({ code: "C001", status: 400 }));
  });
});
