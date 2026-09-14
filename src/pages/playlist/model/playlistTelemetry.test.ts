import { ApiError } from "@/shared/api";

import {
  toDurationBucket,
  toResultCountBucket,
  toSafeErrorCode,
} from "./playlistTelemetry";

describe("playlistTelemetry", () => {
  it("groups request durations without sending raw timing values", () => {
    expect(toDurationBucket(999)).toBe("under_1s");
    expect(toDurationBucket(1_000)).toBe("1s_to_3s");
    expect(toDurationBucket(3_000)).toBe("3s_to_10s");
    expect(toDurationBucket(10_000)).toBe("10s_or_more");
  });

  it("groups result counts without sending song metadata", () => {
    expect(toResultCountBucket(0)).toBe("0");
    expect(toResultCountBucket(5)).toBe("1_to_5");
    expect(toResultCountBucket(6)).toBe("6_to_10");
    expect(toResultCountBucket(11)).toBe("over_10");
  });

  it("allows only normalized API error codes", () => {
    expect(toSafeErrorCode(new ApiError("PLST009", "rate limited"))).toBe("PLST009");
    expect(toSafeErrorCode(new ApiError("student 3025000001", "unsafe"))).toBe(
      "UNKNOWN",
    );
    expect(toSafeErrorCode(new Error("network details"))).toBe("UNKNOWN");
  });
});
