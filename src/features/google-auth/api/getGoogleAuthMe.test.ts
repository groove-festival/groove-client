import { httpClient } from "@/shared/api";

import { getGoogleAuthMe, isGoogleParticipant } from "./getGoogleAuthMe";

vi.mock("@/shared/api", async () => {
  const actual = await vi.importActual<Record<string, unknown>>("@/shared/api");
  return { ...actual, httpClient: { get: vi.fn() } };
});

const httpGet = vi.mocked(httpClient.get);

afterEach(() => {
  vi.clearAllMocks();
});

describe("getGoogleAuthMe", () => {
  it("returns the shared session account", async () => {
    const account = {
      loggedIn: true,
      role: "USER" as const,
      displayName: "홍길동",
      pubId: null,
    };
    httpGet.mockResolvedValueOnce({
      data: { success: true, data: { account }, error: null },
      status: 200,
    });

    await expect(getGoogleAuthMe()).resolves.toEqual(account);
    expect(httpGet).toHaveBeenCalledWith("/auth/me");
    expect(isGoogleParticipant(account)).toBe(true);
  });

  it("does not treat guests or administrators as Google participants", () => {
    expect(
      isGoogleParticipant({
        loggedIn: false,
        role: null,
        displayName: null,
        pubId: null,
      }),
    ).toBe(false);
    expect(
      isGoogleParticipant({
        loggedIn: true,
        role: "STAGE_ADMIN",
        displayName: "운영진",
        pubId: null,
      }),
    ).toBe(false);
  });
});
