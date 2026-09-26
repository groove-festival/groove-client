import { ApiError } from "@/shared/api";

import { pubImageUploadErrorMessage } from "./adminErrorMessages";

describe("pubImageUploadErrorMessage", () => {
  it("explains the size limit when the app rejects the upload", () => {
    expect(
      pubImageUploadErrorMessage(new ApiError("C413", "too large", 413)),
    ).toContain("너무 커요");
  });

  it("explains the size limit when nginx answers instead of the app", () => {
    // 용량 초과는 앞단 nginx 가 먼저 막고, 그 응답은 공통 봉투가 아니라 HTML 이라
    // code 가 비어 NETWORK 로 정규화된다. code 만 보면 일반 실패 문구가 뜬다.
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
