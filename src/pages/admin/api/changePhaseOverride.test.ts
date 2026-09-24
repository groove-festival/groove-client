import { httpClient } from "@/shared/api";

import { changePhaseOverride } from "./changePhaseOverride";

vi.mock("@/shared/api", async () => {
  const actual = await vi.importActual<Record<string, unknown>>("@/shared/api");
  return { ...actual, httpClient: { put: vi.fn() } };
});

const httpPut = vi.mocked(httpClient.put);

afterEach(() => {
  vi.clearAllMocks();
});

describe("changePhaseOverride", () => {
  it("sends the target phase", async () => {
    httpPut.mockResolvedValueOnce({
      data: {
        success: true,
        data: { phase: "SUBMISSION", phaseOverride: "SUBMISSION" },
        error: null,
      },
      status: 200,
    });

    await expect(changePhaseOverride("SUBMISSION")).resolves.toEqual({
      phase: "SUBMISSION",
      phaseOverride: "SUBMISSION",
    });
    expect(httpPut).toHaveBeenCalledWith("/admin/promo/playlist-phase", {
      phase: "SUBMISSION",
    });
  });

  it("sends null to clear the override", async () => {
    httpPut.mockResolvedValueOnce({
      data: {
        success: true,
        data: { phase: "SELECTION", phaseOverride: null },
        error: null,
      },
      status: 200,
    });

    await changePhaseOverride(null);

    expect(httpPut).toHaveBeenCalledWith("/admin/promo/playlist-phase", {
      phase: null,
    });
  });
});
