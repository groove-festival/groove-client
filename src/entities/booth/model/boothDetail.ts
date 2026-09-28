import type { Booth } from "./booths";

export const menuCategories = ["SET", "MAIN", "SIDE", "DRINK"] as const;

export type MenuCategory = (typeof menuCategories)[number];

// 메뉴에 붙는 선택 옵션. 손님이 체크하면 그 줄 전체(수량 모두)에 적용된다.
// "메인 메뉴와 함께 주문 시 −1,000원"처럼 확인할 수 없는 조건도 있어 자율
// 체크로 받고, 직원이 주문 내역에서 보고 판단한다. priceDelta는 음수일 수 있다.
export interface BoothMenuOption {
  id: number;
  label: string;
  priceDelta: number;
}

export interface BoothMenuItem {
  category: MenuCategory;
  description: string | null;
  id: number;
  imageUrl: string | null;
  isSoldOut: boolean;
  name: string;
  options: BoothMenuOption[];
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

// 옵션 가격 차이를 부호와 함께 적는다. 빼기는 하이픈이 아니라 마이너스
// 기호(−)로 적어야 숫자 옆에서 또렷하게 읽힌다.
export const formatMenuOptionPriceDelta = (priceDelta: number) => {
  const sign = priceDelta < 0 ? "−" : "+";

  return `${sign}${Math.abs(priceDelta).toLocaleString("ko-KR")}원`;
};

// 주문 화면은 상차림비를 메뉴 묶음에서 떼어 목록 맨 위 카드로 따로 보여준다.
// createBoothMenuSections는 상차림비를 "상차림비" 섹션으로 되돌려주므로, 주문
// 화면이 그대로 쓰면 같은 항목이 섹션과 단독 카드에 두 번 잡힌다. 1인·테이블당
// 상차림비를 나누거나 연합 주막이 학과별로 따로 받는 경우가 있어 여러 개를
// 모두 넘긴다.
export const createBoothOrderMenus = (menus: BoothMenuItem[]) => ({
  menuSections: createBoothMenuSections(menus.filter((menu) => !menu.separateCharge)),
  separateChargeItems: menus.filter((menu) => menu.separateCharge),
});

// QR 주문 화면이 쓰는 주막 정보. 계좌는 주막이 아니라 주문 응답(PUB-4~7)에
// 담겨 오므로 여기 두지 않는다.
export interface BoothOrderDetail extends BoothDetail {
  separateChargeItems: BoothMenuItem[];
}
