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
      options: [],
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

describe("menu options", () => {
  const option = (label: string, priceDelta: string) => ({ label, priceDelta });

  it("sends trimmed labels and signed price deltas, discounts included", () => {
    expect(
      toMenuDraftPayload(
        draft({
          options: [
            option(" 불파게티로 변경 ", "1000"),
            option("메인 메뉴와 함께 주문했어요", " -1000 "),
            // 휴대폰 자판이 넣는 마이너스 기호도 음수로 읽는다.
            option("학생증 할인", "−500"),
          ],
        }),
      )?.options,
    ).toEqual([
      { label: "불파게티로 변경", priceDelta: 1_000 },
      { label: "메인 메뉴와 함께 주문했어요", priceDelta: -1_000 },
      { label: "학생증 할인", priceDelta: -500 },
    ]);
  });

  it("rejects a blank label, a long label and a non-numeric delta", () => {
    expect(getMenuDraftError(draft({ options: [option("  ", "1000")] }))).toBe(
      "옵션 이름을 입력해 주세요.",
    );
    expect(getMenuDraftError(draft({ options: [option("가".repeat(51), "0")] }))).toBe(
      "옵션 이름은 50자 이내로 입력해 주세요.",
    );
    expect(getMenuDraftError(draft({ options: [option("곱빼기", "")] }))).toBe(
      "옵션 가격은 숫자로 입력해 주세요. 할인이면 앞에 -를 붙여요.",
    );
    expect(getMenuDraftError(draft({ options: [option("곱빼기", "1,000")] }))).toBe(
      "옵션 가격은 숫자로 입력해 주세요. 할인이면 앞에 -를 붙여요.",
    );
  });

  it("allows up to ten options", () => {
    const options = (count: number) =>
      Array.from({ length: count }, (_, index) => option(`옵션 ${index}`, "0"));

    expect(getMenuDraftError(draft({ options: options(10) }))).toBeNull();
    expect(getMenuDraftError(draft({ options: options(11) }))).toBe(
      "옵션은 10개까지 추가할 수 있어요.",
    );
  });

  it("keeps the price from going below zero with every discount ticked", () => {
    expect(
      getMenuDraftError(
        draft({
          price: "1500",
          options: [option("할인 1", "-1000"), option("할인 2", "-1000")],
        }),
      ),
    ).toBe("할인 옵션을 모두 골라도 가격이 0원 아래로 내려가지 않게 해 주세요.");
  });

  it("replaces the whole option list on update, an empty list clearing it", () => {
    // PUB-A6은 options를 보내면 목록을 통째로 바꾼다. 빈 배열을 보내야 지울 수 있다.
    expect(toMenuUpdateBody(toMenuDraftPayload(draft({}))!).options).toEqual([]);
    expect(
      toMenuUpdateBody(
        toMenuDraftPayload(draft({ options: [option("곱빼기", "2000")] }))!,
      ).options,
    ).toEqual([{ label: "곱빼기", priceDelta: 2_000 }]);
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
  it("fills the option rows from an existing menu", () => {
    expect(
      toMenuDraft({
        category: "MAIN",
        description: null,
        id: 8,
        imageUrl: null,
        isSoldOut: false,
        name: "짜파게티",
        options: [{ id: 3, label: "메인 메뉴와 함께 주문했어요", priceDelta: -1_000 }],
        price: 5_000,
        separateCharge: false,
      }).options,
    ).toEqual([{ label: "메인 메뉴와 함께 주문했어요", priceDelta: "-1000" }]);
  });

  it("fills the form from an existing menu", () => {
    expect(
      toMenuDraft({
        category: "DRINK",
        description: null,
        id: 7,
        imageUrl: null,
        isSoldOut: true,
        name: "콜라",
        options: [],
        price: 2000,
        separateCharge: false,
      }),
    ).toEqual({
      category: "DRINK",
      description: "",
      name: "콜라",
      options: [],
      price: "2000",
      separateCharge: false,
    });
  });
});
