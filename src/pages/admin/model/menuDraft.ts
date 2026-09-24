import { type BoothMenuItem, type MenuCategory } from "@/entities/booth";

// 메뉴 등록·수정 폼의 입력값. 가격은 입력 중 빈 문자열일 수 있어 문자열로
// 들고 있다가 제출 시점에 숫자로 바꾼다.
export interface MenuDraft {
  category: MenuCategory;
  description: string;
  name: string;
  price: string;
  separateCharge: boolean;
}

export const emptyMenuDraft: MenuDraft = {
  category: "MAIN",
  description: "",
  name: "",
  price: "",
  separateCharge: false,
};

export const toMenuDraft = (menu: BoothMenuItem): MenuDraft => ({
  category: menu.category,
  description: menu.description ?? "",
  name: menu.name,
  price: String(menu.price),
  separateCharge: menu.separateCharge,
});

export const menuCategoryLabels: Record<MenuCategory, string> = {
  SET: "세트",
  MAIN: "메인",
  SIDE: "사이드",
  DRINK: "음료",
};

// 서버가 요구하는 최소 가격. 0원 메뉴는 등록·수정 모두 거부된다 (실서버 확인,
// 2026-09-25: `price: must be greater than or equal to 1`). 프론트가 0을 통과시키면
// 저장 순간에야 모호한 안내가 뜬다.
const MIN_MENU_PRICE = 1;

const parsePrice = (price: string): number | null => {
  const trimmed = price.trim();

  if (!/^\d+$/.test(trimmed)) {
    return null;
  }

  const parsed = Number(trimmed);

  return parsed < MIN_MENU_PRICE ? null : parsed;
};

// 서버에 보내기 전에 막을 입력이면 문구를, 괜찮으면 null을 준다. 분류는
// select로만 고르므로 여기서 검사하지 않는다.
export const getMenuDraftError = (draft: MenuDraft): string | null => {
  if (!draft.name.trim()) {
    return "메뉴 이름을 입력해 주세요.";
  }

  if (parsePrice(draft.price) === null) {
    return "가격은 1원 이상의 숫자로 입력해 주세요.";
  }

  return null;
};

export interface MenuDraftPayload {
  category: MenuCategory;
  description: string | null;
  name: string;
  price: number;
  separateCharge: boolean;
}

// 검증을 통과한 draft만 넘긴다. 통과하지 못하면 null을 돌려 호출부가 제출을
// 멈추게 한다. 등록(PUB-A5)은 설명이 없으면 null로 보낸다.
export const toMenuDraftPayload = (draft: MenuDraft): MenuDraftPayload | null => {
  const price = parsePrice(draft.price);

  if (getMenuDraftError(draft) !== null || price === null) {
    return null;
  }

  return {
    category: draft.category,
    description: draft.description.trim() || null,
    name: draft.name.trim(),
    price,
    separateCharge: draft.separateCharge,
  };
};

export type MenuUpdateBody = Omit<MenuDraftPayload, "description"> & {
  description: string;
};

// 수정(PUB-A6)에 보낼 본문. 등록과 달리 설명을 비울 때 null이 아니라 빈 문자열을
// 보낸다 — 서버는 null을 "이 항목은 보내지 않음"으로 읽어 기존 설명을 그대로 두므로,
// null로 보내면 한 번 넣은 설명을 지울 방법이 없다 (실서버 확인, 2026-09-25).
export const toMenuUpdateBody = (payload: MenuDraftPayload): MenuUpdateBody => ({
  ...payload,
  description: payload.description ?? "",
});
