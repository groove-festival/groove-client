import { ApiError } from "@/shared/api";

import { pubImageUploadErrorMessage } from "./adminErrorMessages";

describe("pubImageUploadErrorMessage", () => {
  it("explains the size limit when the app rejects the upload", () => {
    expect(
      pubImageUploadErrorMessage(new ApiError("C413", "too large", 413)),
    ).toContain("너무 커요");
  });

  it("explains the size limit when nginx answers instead of the app", () => {
    expect(
      pubImageUploadErrorMessage(new ApiError("NETWORK", "Request failed", 413)),
    ).toContain("너무 커요");
  });

  it("explains the accepted formats", () => {
    expect(pubImageUploadErrorMessage(new ApiError("C001", "bad", 400))).toContain(
      "JPG·PNG·WebP",
    );
  });

  it("tells the user to refresh when the menu is already gone", () => {
    expect(
      pubImageUploadErrorMessage(new ApiError("PUB004", "no menu", 404)),
    ).toContain("이미 삭제된 메뉴");
  });

  it("falls back for an unknown failure", () => {
    expect(pubImageUploadErrorMessage(new Error("boom"))).toContain("실패했어요");
  });
});
