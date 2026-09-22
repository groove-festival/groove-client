import { AxiosError, AxiosHeaders } from "axios";

import { httpClient } from "@/shared/api";

import { getBoothDetail, isBoothNotFound } from "./getBoothDetail";

vi.mock("@/shared/api", async () => {
  const actual = await vi.importActual<Record<string, unknown>>("@/shared/api");
  return { ...actual, httpClient: { get: vi.fn() } };
});

const httpGet = vi.mocked(httpClient.get);

afterEach(() => {
  vi.clearAllMocks();
});

describe("getBoothDetail", () => {
  it("maps PUB-2 menus into separate-charge and category sections", async () => {
    httpGet.mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          pub: {
            area: "PARKING",
            boothCode: "computer science",
            colleges: ["IT"],
            departments: ["컴퓨터학부"],
            description: "컴퓨터학부 주막",
            name: "컴주점",
            status: "OPEN",
            xRatio: 0.3,
            yRatio: 0.7,
          },
          menuBoardImageUrl: "https://example.com/menu.webp",
          menus: [
            {
              menuId: 1,
              name: "상차림비",
              description: null,
              price: 1_000,
              soldOut: false,
              imageUrl: null,
              category: "SIDE",
              separateCharge: true,
            },
            {
              menuId: 2,
              name: "김치전",
              description: "바삭한 김치전",
              price: 15_000,
              soldOut: true,
              imageUrl: null,
              category: "MAIN",
              separateCharge: false,
            },
          ],
        },
        error: null,
      },
      status: 200,
    });

    const detail = await getBoothDetail("computer science");

    expect(httpGet).toHaveBeenCalledWith("/pubs/computer%20science");
    expect(detail.menuSections.map(({ title }) => title)).toEqual([
      "상차림비",
      "메인 메뉴",
    ]);
    expect(detail.menuSections[1].items[0]).toMatchObject({
      id: 2,
      isSoldOut: true,
      name: "김치전",
    });
  });

  it("recognizes the PUB002 detail-not-found response", async () => {
    const axiosError = new AxiosError("not found", "ERR_BAD_RESPONSE");
    axiosError.response = {
      data: {
        success: false,
        data: null,
        error: { code: "PUB002", message: "주막을 찾을 수 없습니다." },
      },
      status: 404,
      statusText: "",
      headers: {},
      config: { headers: new AxiosHeaders() },
    };
    httpGet.mockRejectedValueOnce(axiosError);

    const error = await getBoothDetail("missing").catch((caught: unknown) => caught);

    expect(isBoothNotFound(error)).toBe(true);
  });
});
