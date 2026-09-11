import { collegeToApiValue, songRequestSchema } from "./songRequestForm";

const validValues = {
  trackId: "1234567890",
  college: "IT",
  studentId: "2025000123",
  department: "컴퓨터학부",
  name: "김그루브",
  nickname: "gv",
};

describe("songRequestSchema", () => {
  it("accepts a fully filled request", () => {
    expect(songRequestSchema.safeParse(validValues).success).toBe(true);
  });

  it("rejects a request without a selected track", () => {
    const result = songRequestSchema.safeParse({ ...validValues, trackId: "" });

    expect(result.success).toBe(false);
  });

  it("rejects a non-numeric student id", () => {
    const result = songRequestSchema.safeParse({
      ...validValues,
      studentId: "25-0001",
    });

    expect(result.success).toBe(false);
  });

  it("rejects a student id that is not exactly 10 digits", () => {
    for (const studentId of ["202500", "202500012345"]) {
      const result = songRequestSchema.safeParse({ ...validValues, studentId });

      expect(result.success).toBe(false);
    }
  });

  it("rejects an unknown college", () => {
    const result = songRequestSchema.safeParse({ ...validValues, college: "약학" });

    expect(result.success).toBe(false);
  });

  it("rejects missing text fields", () => {
    for (const key of ["department", "name", "nickname"] as const) {
      const result = songRequestSchema.safeParse({ ...validValues, [key]: "" });

      expect(result.success).toBe(false);
    }
  });
});

describe("collegeToApiValue", () => {
  it("maps every UI label to a backend enum value", () => {
    expect(collegeToApiValue).toEqual({
      IT: "IT",
      간호: "NURSING",
      예술: "ART",
      사회: "SOCIAL",
      사범: "EDU",
      자연: "NATURE",
    });
  });
});
