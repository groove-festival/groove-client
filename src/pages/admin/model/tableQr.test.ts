import { buildTableOrderUrl } from "./tableQr";

describe("buildTableOrderUrl", () => {
  it("builds the front-end order route, not the API path the server returns", () => {
    // PUB-A11의 orderPath는 `/pubs/{boothCode}/tables/{tableCode}` 라 그대로
    // QR에 넣으면 열리지 않는다.
    expect(
      buildTableOrderUrl({
        basePath: "/groove",
        boothCode: "elec-eh",
        origin: "https://chcse.knu.ac.kr",
        tableCode: "a1b2c3",
      }),
    ).toBe("https://chcse.knu.ac.kr/groove/pub/elec-eh/a1b2c3");
  });

  it("does not double the slash when the app is served from the root", () => {
    expect(
      buildTableOrderUrl({
        basePath: "/",
        boothCode: "elec-eh",
        origin: "http://localhost:5173",
        tableCode: "a1b2c3",
      }),
    ).toBe("http://localhost:5173/pub/elec-eh/a1b2c3");
  });

  it("escapes codes so a stray character cannot break the route", () => {
    expect(
      buildTableOrderUrl({
        basePath: "/groove",
        boothCode: "a/b",
        origin: "https://example.test",
        tableCode: "c d",
      }),
    ).toBe("https://example.test/groove/pub/a%2Fb/c%20d");
  });
});
