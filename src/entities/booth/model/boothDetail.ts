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
