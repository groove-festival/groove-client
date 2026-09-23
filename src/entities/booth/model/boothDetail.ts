import type { Booth } from "./booths";

export const menuCategories = ["SET", "MAIN", "SIDE", "DRINK"] as const;

export type MenuCategory = (typeof menuCategories)[number];

export interface BoothMenuItem {
  category: MenuCategory;
  description: string | null;
  id: number;
  imageUrl: string | null;
  isSoldOut: boolean;
  name: string;
  price: number;
  separateCharge: boolean;
}

export interface BoothMenuSection {
  id: string;
  items: BoothMenuItem[];
  title: string;
}

export interface BoothDetail extends Booth {
  menuBoardImageUrl: string | null;
  menuSections: BoothMenuSection[];
}

const menuSectionTitles: Record<MenuCategory, string> = {
  SET: "세트 메뉴",
  MAIN: "메인 메뉴",
  SIDE: "사이드 메뉴",
  DRINK: "음료",
};

export const createBoothMenuSections = (menus: BoothMenuItem[]): BoothMenuSection[] => {
  const separateChargeItems = menus.filter((menu) => menu.separateCharge);
  const sections = menuCategories.flatMap((category) => {
    const items = menus.filter(
      (menu) => !menu.separateCharge && menu.category === category,
    );

    return items.length
      ? [{ id: category.toLowerCase(), title: menuSectionTitles[category], items }]
      : [];
  });

  return separateChargeItems.length
    ? [
        { id: "separate-charge", title: "상차림비", items: separateChargeItems },
        ...sections,
      ]
    : sections;
};

// 주문 화면은 상차림비를 메뉴 묶음에서 떼어 목록 맨 위 카드로 따로 보여준다.
// createBoothMenuSections는 상차림비를 "상차림비" 섹션으로 되돌려주므로, 주문
// 화면이 그대로 쓰면 같은 항목이 섹션과 단독 카드에 두 번 잡힌다.
export const createBoothOrderMenus = (menus: BoothMenuItem[]) => ({
  menuSections: createBoothMenuSections(menus.filter((menu) => !menu.separateCharge)),
  separateChargeItem: menus.find((menu) => menu.separateCharge) ?? null,
});

// QR 주문 화면이 쓰는 주막 정보. 계좌는 주막이 아니라 주문 응답(PUB-4~7)에
// 담겨 오므로 여기 두지 않는다.
export interface BoothOrderDetail extends BoothDetail {
  separateChargeItem: BoothMenuItem | null;
}
