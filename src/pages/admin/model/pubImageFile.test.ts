import { getPubImageFileError, MAX_PUB_IMAGE_BYTES } from "./pubImageFile";

const file = (type: string, size: number) => {
  const created = new File(["x"], "menu.jpg", { type });

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
    expect(getPubImageFileError(file("image/png", 10 * 1024 * 1024))).not.toBeNull();
  });

  it("tells the user how big the rejected file was", () => {
    expect(getPubImageFileError(file("image/png", 12 * 1024 * 1024))).toContain("12MB");
  });
});
