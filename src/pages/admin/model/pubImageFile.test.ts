import { getPubImageFileError, MAX_PUB_IMAGE_BYTES } from "./pubImageFile";

const file = (type: string, size: number) => {
  const created = new File(["x"], "menu.jpg", { type });
  // File 생성자로는 크기를 원하는 만큼 만들 수 없어 size만 덮어쓴다.
  Object.defineProperty(created, "size", { value: size });

  return created;
};

describe("getPubImageFileError", () => {
  it.each(["image/jpeg", "image/png", "image/webp"])("accepts %s", (type) => {
    expect(getPubImageFileError(file(type, 1024))).toBeNull();
  });

  it("rejects a format the server does not take", () => {
    expect(getPubImageFileError(file("image/gif", 1024))).toBe(
      "JPG·PNG·WebP 이미지만 올릴 수 있어요.",
    );
    expect(getPubImageFileError(file("application/pdf", 1024))).not.toBeNull();
  });

  it("stops an oversized file before the 413 round trip", () => {
    expect(getPubImageFileError(file("image/png", MAX_PUB_IMAGE_BYTES + 1))).toContain(
      "10MB 보다 작은",
    );
  });

  it("allows a file at exactly the limit", () => {
    expect(getPubImageFileError(file("image/png", MAX_PUB_IMAGE_BYTES))).toBeNull();
  });

  it("rejects a file of exactly 10MB, which nginx always blocks", () => {
    // client_max_body_size 가 요청 본문 전체에 걸려, multipart 경계가 붙는 순간
    // 10MB 파일은 언제나 초과한다 (실서버 확인: 10MB-512B 통과, 10MB 차단).
    expect(getPubImageFileError(file("image/png", 10 * 1024 * 1024))).not.toBeNull();
  });

  it("tells the user how big the rejected file was", () => {
    expect(getPubImageFileError(file("image/png", 12 * 1024 * 1024))).toContain("12MB");
  });
});
