import { ApiError } from "@/shared/api";

import { searchErrorMessage, submitErrorMessage } from "./songRequestErrorMessages";

describe("song request error messages", () => {
  it("uses fallback copy for an unknown API code", () => {
    const error = new ApiError("constructor", "Unexpected server code");

    expect(searchErrorMessage(error)).toBe(
      "검색에 실패했어요. 잠시 후 다시 시도해 주세요.",
    );
    expect(submitErrorMessage(error)).toBe(
      "신청에 실패했어요. 잠시 후 다시 시도해 주세요.",
    );
  });
});
