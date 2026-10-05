import { type BoothMenuItem, type MenuCategory } from "@/entities/booth";

export interface MenuOptionDraft {
  label: string;
  priceDelta: string;
}

export interface MenuDraft {
  category: MenuCategory;
  description: string;
  name: string;
  options: MenuOptionDraft[];
  price: string;
  separateCharge: boolean;
}

export const emptyMenuDraft: MenuDraft = {
  category: "MAIN",
  description: "",
  name: "",
  options: [],
  price: "",
  separateCharge: false,
};

export const emptyMenuOptionDraft: MenuOptionDraft = { label: "", priceDelta: "" };

export const MAX_MENU_OPTIONS = 10;
export const MAX_MENU_OPTION_LABEL_LENGTH = 50;

export const toMenuDraft = (menu: BoothMenuItem): MenuDraft => ({
  category: menu.category,
  description: menu.description ?? "",
  name: menu.name,
  options: menu.options.map((option) => ({
    label: option.label,
    priceDelta: String(option.priceDelta),
  })),
  price: String(menu.price),
  separateCharge: menu.separateCharge,
});

export const menuCategoryLabels: Record<MenuCategory, string> = {
  SET: "세트",
  MAIN: "메인",
  SIDE: "사이드",
  DRINK: "음료",
};

const MIN_MENU_PRICE = 1;

const parsePrice = (price: string): number | null => {
  const trimmed = price.trim();

  if (!/^\d+$/.test(trimmed)) {
    return null;
  }

  const parsed = Number(trimmed);

  return parsed < MIN_MENU_PRICE ? null : parsed;
};

const parsePriceDelta = (priceDelta: string): number | null => {
  const trimmed = priceDelta.trim().replace(/^−/, "-");

  return /^-?\d+$/.test(trimmed) ? Number(trimmed) : null;
};

const getMenuOptionError = (option: MenuOptionDraft): string | null => {
  const label = option.label.trim();

  if (!label) {
    return "옵션 이름을 입력해 주세요.";
  }

  if (label.length > MAX_MENU_OPTION_LABEL_LENGTH) {
    return `옵션 이름은 ${MAX_MENU_OPTION_LABEL_LENGTH}자 이내로 입력해 주세요.`;
  }

  if (parsePriceDelta(option.priceDelta) === null) {
    return "옵션 가격은 숫자로 입력해 주세요. 할인이면 앞에 -를 붙여요.";
  }

  return null;
};

export const getMenuDraftError = (draft: MenuDraft): string | null => {
  if (!draft.name.trim()) {
    return "메뉴 이름을 입력해 주세요.";
  }

  const price = parsePrice(draft.price);

  if (price === null) {
    return "가격은 1원 이상의 숫자로 입력해 주세요.";
  }

  if (draft.options.length > MAX_MENU_OPTIONS) {
    return `옵션은 ${MAX_MENU_OPTIONS}개까지 추가할 수 있어요.`;
  }

  for (const option of draft.options) {
    const optionError = getMenuOptionError(option);

    if (optionError) {
      return optionError;
    }
  }

  const totalDiscount = draft.options.reduce(
    (sum, option) => sum + Math.min(0, parsePriceDelta(option.priceDelta) ?? 0),
    0,
  );

  if (price + totalDiscount < 0) {
    return "할인 옵션을 모두 골라도 가격이 0원 아래로 내려가지 않게 해 주세요.";
  }

  return null;
};

export interface MenuOptionPayload {
  label: string;
  priceDelta: number;
}

export interface MenuDraftPayload {
  category: MenuCategory;
  description: string | null;
  name: string;

  options: MenuOptionPayload[];
  price: number;
  separateCharge: boolean;
}

export const toMenuDraftPayload = (draft: MenuDraft): MenuDraftPayload | null => {
  const price = parsePrice(draft.price);

  if (getMenuDraftError(draft) !== null || price === null) {
    return null;
  }

  return {
    category: draft.category,
    description: draft.description.trim() || null,
    name: draft.name.trim(),
    options: draft.options.map((option) => ({
      label: option.label.trim(),
      priceDelta: parsePriceDelta(option.priceDelta) ?? 0,
    })),
    price,
    separateCharge: draft.separateCharge,
  };
};

export type MenuUpdateBody = Omit<MenuDraftPayload, "description"> & {
  description: string;
};

export const toMenuUpdateBody = (payload: MenuDraftPayload): MenuUpdateBody => ({
  ...payload,
  description: payload.description ?? "",
});
