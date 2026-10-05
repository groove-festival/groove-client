import { readStorageItem, writeStorageItem } from "./browserStorage";

afterEach(() => {
  vi.restoreAllMocks();
  window.localStorage.clear();
  window.sessionStorage.clear();
});

describe("browserStorage", () => {
  it("stores notices independently in local and session storage", () => {
    expect(writeStorageItem("local", "notice", "permanent")).toBe(true);
    expect(writeStorageItem("session", "notice", "this visit")).toBe(true);
    expect(readStorageItem("local", "notice")).toBe("permanent");
    expect(readStorageItem("session", "notice")).toBe("this visit");
    expect(writeStorageItem("local", "notice", null)).toBe(true);
    expect(readStorageItem("local", "notice")).toBeNull();
    expect(readStorageItem("session", "notice")).toBe("this visit");
  });

  it("handles denied access to the storage property itself", () => {
    vi.spyOn(window, "localStorage", "get").mockImplementation(() => {
      throw new Error("denied");
    });
    expect(readStorageItem("local", "notice")).toBeNull();
    expect(writeStorageItem("local", "notice", "true")).toBe(false);
    expect(writeStorageItem("session", "notice", "true")).toBe(true);
  });
});
