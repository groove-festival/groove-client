import {
  createSongRequest,
  SongRequestConflictError,
  toCreateSongRequestBody,
} from "./createSongRequest";

const baseValues = {
  song: "Ditto",
  college: "IT" as const,
  department: "컴퓨터학부",
  name: "김그루브",
  nickname: "gv",
};

const valuesFor = (studentId: string) => ({ ...baseValues, studentId });

describe("toCreateSongRequestBody", () => {
  it("maps form values to the request body and defaults overwrite to false", () => {
    expect(toCreateSongRequestBody(valuesFor("20250001"))).toEqual({
      song: "Ditto",
      college: "IT",
      studentId: "20250001",
      department: "컴퓨터학부",
      name: "김그루브",
      nickname: "gv",
      overwrite: false,
    });
  });

  it("carries the overwrite flag when set", () => {
    expect(toCreateSongRequestBody(valuesFor("20250001"), true).overwrite).toBe(true);
  });
});

describe("createSongRequest (mock)", () => {
  it("echoes the song and returns empty artist metadata", async () => {
    const response = await createSongRequest(
      toCreateSongRequestBody(valuesFor("20259001")),
    );

    expect(response.song).toBe("Ditto");
    expect(response.artist).toBeNull();
    expect(response.thumbnailUrl).toBeNull();
    expect(response.id).toMatch(/^mock-/);
  });

  it("rejects a second request for the same student id", async () => {
    await createSongRequest(toCreateSongRequestBody(valuesFor("20259002")));

    await expect(
      createSongRequest(toCreateSongRequestBody(valuesFor("20259002"))),
    ).rejects.toBeInstanceOf(SongRequestConflictError);
  });

  it("accepts a duplicate when overwrite is true", async () => {
    await createSongRequest(toCreateSongRequestBody(valuesFor("20259003")));

    const response = await createSongRequest(
      toCreateSongRequestBody(valuesFor("20259003"), true),
    );

    expect(response.song).toBe("Ditto");
  });
});
