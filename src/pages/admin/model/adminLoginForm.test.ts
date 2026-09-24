import { adminLoginSchema } from "./adminLoginForm";

describe("adminLoginSchema", () => {
  it("accepts a filled id and password", () => {
    expect(
      adminLoginSchema.safeParse({ loginId: "pub-jeonja-eh", password: "secret" })
        .success,
    ).toBe(true);
  });

  it("rejects an empty id", () => {
    expect(
      adminLoginSchema.safeParse({ loginId: "  ", password: "secret" }).success,
    ).toBe(false);
  });

  it("rejects an empty password", () => {
    expect(adminLoginSchema.safeParse({ loginId: "admin", password: "" }).success).toBe(
      false,
    );
  });
});
