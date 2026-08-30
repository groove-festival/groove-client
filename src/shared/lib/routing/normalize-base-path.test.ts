import { normalizeBasePath } from "./normalize-base-path";

describe("normalizeBasePath", () => {
  it.each([
    ["/groove/", "/groove"],
    ["groove", "/groove"],
    ["/", "/"],
    ["", "/"],
  ])("normalizes %s to %s", (input, expected) => {
    expect(normalizeBasePath(input)).toBe(expected);
  });
});
