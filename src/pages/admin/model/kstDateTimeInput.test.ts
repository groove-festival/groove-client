import { dateTimeLocalToIso, isoToDateTimeLocal } from "./kstDateTimeInput";

describe("isoToDateTimeLocal", () => {
  it("strips seconds and the KST offset", () => {
    expect(isoToDateTimeLocal("2026-10-01T18:00:00+09:00")).toBe("2026-10-01T18:00");
  });

  it("is empty for null or undefined", () => {
    expect(isoToDateTimeLocal(null)).toBe("");
    expect(isoToDateTimeLocal(undefined)).toBe("");
  });
});

describe("dateTimeLocalToIso", () => {
  it("appends seconds without an offset", () => {
    expect(dateTimeLocalToIso("2026-10-01T18:00")).toBe("2026-10-01T18:00:00");
  });

  it("is undefined for an empty value", () => {
    expect(dateTimeLocalToIso("")).toBeUndefined();
  });
});
