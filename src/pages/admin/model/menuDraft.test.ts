import {
  emptyMenuDraft,
  getMenuDraftError,
  type MenuDraft,
  toMenuDraft,
  toMenuDraftPayload,
  toMenuUpdateBody,
} from "./menuDraft";

const draft = (over: Partial<MenuDraft>): MenuDraft => ({
  ...emptyMenuDraft,
  name: "닭발",
  price: "15000",
  ...over,
});

describe("getMenuDraftError", () => {
  it("accepts a complete draft", () => {
    expect(getMenuDraftError(draft({}))).toBeNull();
  });

  it("rejects a blank name", () => {
    expect(getMenuDraftError(draft({ name: "   " }))).toBe(
      "메뉴 이름을 입력해 주세요.",
    );
  });

  // 0원은 서버가 거부한다 (price: must be greater than or equal to 1).
  it.each(["", "1500원", "-100", "1.5", "12 000", "0"])(
    "rejects the price %s",
    (price) => {
      expect(getMenuDraftError(draft({ price }))).toBe(
        "가격은 1원 이상의 숫자로 입력해 주세요.",
      );
    },
  );

  it("allows the cheapest price the server accepts", () => {
    expect(getMenuDraftError(draft({ price: "1" }))).toBeNull();
  });
});

describe("toMenuDraftPayload", () => {
  it("trims the text fields and turns the price into a number", () => {
    expect(
      toMenuDraftPayload(
        draft({ name: "  닭발 ", description: "  매운맛 ", price: "15000" }),
      ),
    ).toEqual({
      category: "MAIN",
      description: "매운맛",
      name: "닭발",
      price: 15_000,
      separateCharge: false,
    });
  });

  it("sends an omitted description as null rather than an empty string", () => {
    expect(toMenuDraftPayload(draft({ description: "   " }))?.description).toBeNull();
  });

  it("refuses to build a payload from an invalid draft", () => {
    expect(toMenuDraftPayload(draft({ name: "" }))).toBeNull();
    expect(toMenuDraftPayload(draft({ price: "무료" }))).toBeNull();
    expect(toMenuDraftPayload(draft({ price: "0" }))).toBeNull();
  });
});

describe("toMenuUpdateBody", () => {
  it("clears the description with an empty string, not null", () => {
    // 서버는 null 을 "보내지 않음"으로 읽어 기존 설명을 그대로 둔다. null 로 보내면
    // 한 번 넣은 설명을 지울 수 없다 (실서버 확인).
    const payload = toMenuDraftPayload(draft({ description: "   " }));

    expect(payload?.description).toBeNull();
    expect(toMenuUpdateBody(payload!).description).toBe("");
  });

  it("keeps a filled description as is", () => {
    const payload = toMenuDraftPayload(draft({ description: "매운맛" }));

    expect(toMenuUpdateBody(payload!).description).toBe("매운맛");
  });
});

describe("toMenuDraft", () => {
  it("fills the form from an existing menu", () => {
    expect(
      toMenuDraft({
        category: "DRINK",
        description: null,
        id: 7,
        imageUrl: null,
        isSoldOut: true,
        name: "콜라",
        price: 2000,
        separateCharge: false,
      }),
    ).toEqual({
      category: "DRINK",
      description: "",
      name: "콜라",
      price: "2000",
      separateCharge: false,
    });
  });
});
