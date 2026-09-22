import menuBoard from "../festival-visuals/menu-board.png";
import {
  type BoothMenuSection,
  type BoothOrderDetail,
  type MenuCategory,
} from "./boothDetail";

// PUB-3~PUB-7 연동 전 QR 주문 데모가 지원하던 주막 코드만 유지한다. 목록과
// 일반 상세 화면은 이 fixture를 사용하지 않고 PUB-1·PUB-2 응답을 사용한다.
const boothOrderFixtureCodes = new Set([
  "electronics-eh",
  "electronics-b-design",
  "autonomy",
  "electronics-a-music",
  "mobile-welfare",
  "electrical-sociology",
  "electronics-cd",
  "home-korean-education",
  "education-chemistry",
  "german-geography-education",
  "biology-math-education",
  "english-physical-education",
  "geography-library",
  "electronics-f",
  "nursing",
  "fine-art",
  "physics",
  "geology",
  "oceanography",
  "biotechnology",
  "psychology",
  "computer-science",
]);

const createMenuItems = ({
  category,
  count,
  firstId,
  price,
}: {
  category: MenuCategory;
  count: number;
  firstId: number;
  price: number;
}) =>
  Array.from({ length: count }, (_, index) => ({
    category,
    description: "메뉴설명",
    id: firstId + index,
    imageUrl: null,
    isSoldOut: false,
    name: "메뉴명",
    price,
    separateCharge: false,
  }));

const menuSectionFixture: BoothMenuSection[] = [
  {
    id: "set",
    title: "세트 메뉴",
    items: createMenuItems({ category: "SET", count: 3, firstId: 1, price: 25_000 }),
  },
  {
    id: "main",
    title: "메인 메뉴",
    items: createMenuItems({ category: "MAIN", count: 4, firstId: 4, price: 15_000 }),
  },
  {
    id: "side",
    title: "사이드 메뉴",
    items: createMenuItems({ category: "SIDE", count: 4, firstId: 8, price: 6_500 }),
  },
  {
    id: "beverage",
    title: "음료",
    items: createMenuItems({ category: "DRINK", count: 2, firstId: 12, price: 2_000 }),
  },
];

export const getBoothOrderFixture = (
  boothCode: string,
): BoothOrderDetail | undefined => {
  if (!boothOrderFixtureCodes.has(boothCode)) {
    return undefined;
  }

  return {
    area: null,
    boothCode,
    colleges: ["IT"],
    departments: ["단대", "학과"],
    description: "부스 설명",
    menuBoardImageUrl: boothCode === "electronics-eh" ? menuBoard : null,
    menuSections: menuSectionFixture,
    name: "주막 이름",
    status: "OPEN",
    xRatio: null,
    yRatio: null,
    separateChargeItem: {
      category: "SIDE",
      description: "",
      id: 14,
      imageUrl: null,
      isSoldOut: false,
      name: "상차림비",
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
