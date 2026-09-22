import { httpClient } from "@/shared/api";

import { getBooths } from "./getBooths";

vi.mock("@/shared/api", async () => {
  const actual = await vi.importActual<Record<string, unknown>>("@/shared/api");
  return { ...actual, httpClient: { get: vi.fn() } };
});

const httpGet = vi.mocked(httpClient.get);

afterEach(() => {
  vi.clearAllMocks();
});

describe("getBooths", () => {
  it("unwraps the PUB-1 response without changing backend order", async () => {
    const booths = [
      {
        area: "PARKING",
        boothCode: "computer-science",
        colleges: ["IT"],
        departments: ["컴퓨터학부"],
        description: "컴퓨터학부 주막",
        name: "컴주점",
        status: "OPEN",
        xRatio: 0.3,
        yRatio: 0.7,
      },
    ];
    httpGet.mockResolvedValueOnce({
      data: { success: true, data: booths, error: null },
      status: 200,
    });

    await expect(getBooths()).resolves.toEqual(booths);
    expect(httpGet).toHaveBeenCalledWith("/pubs");
  });
});
