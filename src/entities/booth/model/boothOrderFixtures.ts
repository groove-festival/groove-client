import { type BoothMenuSection, type BoothOrderDetail } from "./boothDetail";
import { getBoothDetailFixture } from "./boothDetailFixtures";

// 주문 API(PUB-3·PUB-4) 연동 전까지 쓰는 목데이터. 상세 화면의 메뉴 목데이터는
// 가격이 비어 있어 합계를 계산할 수 없으므로, 같은 메뉴 구성에 섹션별 가격만
// 채운다.
const sectionPrices: Record<string, number> = {
  set: 25_000,
  main: 15_000,
  side: 6_500,
  beverage: 2_000,
};

const withSectionPrices = (sections: BoothMenuSection[]): BoothMenuSection[] =>
  sections.map((section) => ({
    ...section,
    items: section.items.map((item) => ({
      ...item,
      price: sectionPrices[section.id] ?? item.price,
    })),
  }));

export const getBoothOrderFixture = (boothId: string): BoothOrderDetail | undefined => {
  const booth = getBoothDetailFixture(boothId);

  if (!booth) {
    return undefined;
  }

  return {
    ...booth,
    menuSections: withSectionPrices(booth.menuSections),
    separateChargeItem: {
      id: "separate-charge",
      name: "상차림비",
      description: "",
      price: 2_000,
      separateCharge: true,
    },
    depositAccount: {
      bank: "국민",
      accountNumber: "000000-00-000000",
      holder: "홍길동",
    },
  };
};
