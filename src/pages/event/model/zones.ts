// PLAN-1 체험존 종류. 선언 순서가 곧 화면 카드 순서다.
export type ZoneType = "MOVE" | "LOVE" | "PROVE" | "RECOVER" | "GROOVE";

export interface MapPoint {
  x: number;
  y: number;
}

export interface ExperienceZone {
  type: ZoneType;
  name: string;
  description: string;
  // 정적 지도 이미지에 적힌 부스 번호.
  boothNumber: number;
  // 지도 박스(EVENT_MAP_SIZE) 기준 부스 중심 좌표. Figma 34:3505 내보내기에서 실측했다.
  boothCenter: MapPoint;
}

// Figma 지도 박스(34:3604) 크기. 부스 좌표는 이 크기에 대한 비율로 배치한다.
export const EVENT_MAP_SIZE = { width: 361, height: 320 } as const;

// API 연동 전까지 쓰는 Figma(34:3578) 문구와 부스 위치.
export const EXPERIENCE_ZONES: readonly ExperienceZone[] = [
  {
    type: "MOVE",
    name: "MOVE ZONE",
    description: "다양한 미니게임을 제한 시간 내에 수행하는 액티비티 프로그램",
    boothNumber: 1,
    boothCenter: { x: 279.6, y: 174.2 },
  },
  {
    type: "LOVE",
    name: "LOVE ZONE",
    description:
      "소중한 사람에게 마음을 전하거나 익명의 누군가와 따뜻한 마음을 주고받는 편지 프로그램",
    boothNumber: 2,
    boothCenter: { x: 238, y: 192.6 },
  },
  {
    type: "PROVE",
    name: "PROVE ZONE",
    description:
      "스프레이로 나만의 흔적을 남기고 모두 함께 하나의 GROOVE 아트월을 완성하는 프로그램",
    boothNumber: 3,
    boothCenter: { x: 76.8, y: 176.8 },
  },
  {
    type: "RECOVER",
    name: "RECOVER ZONE",
    description: "나에게 필요한 의미를 담은 색을 골라 실팔찌를 만드는 프로그램",
    boothNumber: 4,
    boothCenter: { x: 196.4, y: 211 },
  },
  {
    type: "GROOVE",
    name: "GROOVE ZONE",
    description:
      "나에게 영감을 준 순간을 노래로 남기고, 문구를 뽑으며 GRO-OVE를 마무리하는 프로그램",
    boothNumber: 5,
    boothCenter: { x: 98.3, y: 218.7 },
  },
];
