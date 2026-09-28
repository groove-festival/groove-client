import { type AdminOrder } from "./adminOrder";

// 알바생이 자기가 맡은 테이블만 보는 필터. 사람마다 다른 설정이라 서버가 아니라
// 그 기기에만 남긴다. 주막마다 테이블 구성이 달라 주막 코드로 나눠 저장한다.
export const tableFilterStorageKey = (boothCode: string): string =>
  `groove:pub-admin:tables:${boothCode}`;

const isTableNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isInteger(value) && value > 0;

// 저장소를 못 읽거나(시크릿 모드·차단) 값이 깨졌으면 전체 테이블로 연다.
export const readTableFilter = (boothCode: string): number[] => {
  try {
    const raw = window.localStorage.getItem(tableFilterStorageKey(boothCode));
    const parsed: unknown = raw ? JSON.parse(raw) : [];

    return Array.isArray(parsed)
      ? [...new Set(parsed.filter(isTableNumber))].sort((a, b) => a - b)
      : [];
  } catch {
    return [];
  }
};

export const writeTableFilter = (boothCode: string, tables: number[]): void => {
  try {
    const key = tableFilterStorageKey(boothCode);

    if (tables.length === 0) {
      window.localStorage.removeItem(key);
    } else {
      window.localStorage.setItem(key, JSON.stringify(tables));
    }
  } catch {
    // 저장하지 못해도 이번 화면에서는 필터가 동작한다.
  }
};

// 빈 배열은 "전체 테이블"이다.
export const filterOrdersByTables = (
  orders: AdminOrder[],
  tables: number[],
): AdminOrder[] => {
  if (tables.length === 0) {
    return orders;
  }

  const selected = new Set(tables);

  return orders.filter((order) => selected.has(order.tableNumber));
};

export const formatTableFilter = (tables: number[]): string => {
  if (tables.length === 0) {
    return "전체 테이블";
  }

  const shown = tables.slice(0, 4).join("·");

  return tables.length > 4 ? `${shown} 외 ${tables.length - 4}개` : `${shown}번`;
};
