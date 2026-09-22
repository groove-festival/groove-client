import { type BoothDetail, type BoothMenuSection } from "./boothDetail";
import { booths } from "./booths";

import menuBoard from "../festival-visuals/menu-board.png";

const menuSectionFixture: BoothMenuSection[] = [
  {
    id: "set",
    title: "세트 메뉴",
    items: Array.from({ length: 3 }, (_, index) => ({
      id: `set-${index + 1}`,
      name: "메뉴명",
      description: "메뉴설명",
      price: null,
    })),
  },
  {
    id: "main",
    title: "메인 메뉴",
    items: Array.from({ length: 4 }, (_, index) => ({
      id: `main-${index + 1}`,
      name: "메뉴명",
      description: "메뉴설명",
      price: null,
    })),
  },
  {
    id: "side",
    title: "사이드 메뉴",
    items: Array.from({ length: 4 }, (_, index) => ({
      id: `side-${index + 1}`,
      name: "메뉴명",
      description: "메뉴설명",
      price: null,
    })),
  },
  {
    id: "beverage",
    title: "음료",
    items: Array.from({ length: 2 }, (_, index) => ({
      id: `beverage-${index + 1}`,
      name: "메뉴명",
      description: "메뉴설명",
      price: null,
    })),
  },
];

const boothDetailFixtures = new Map<string, BoothDetail>(
  booths.map((booth, index) => [
    booth.id,
    {
      id: booth.id,
      name: "주막 이름",
      description: "부스 설명",
      collegeAndDepartment: "단대•학과",
      menuImageUrl: index === 0 ? menuBoard : null,
      menuSections: menuSectionFixture,
    },
  ]),
);

export const getBoothDetailFixture = (boothId: string): BoothDetail | undefined =>
  boothDetailFixtures.get(boothId);
