import { type AdminOrder } from "./adminOrder";
import { readStorageItem, writeStorageItem } from "@/shared/lib/storage";

export const tableFilterStorageKey = (boothCode: string): string =>
  `groove:pub-admin:tables:${boothCode}`;

const isTableNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isInteger(value) && value > 0;

export const readTableFilter = (boothCode: string): number[] => {
  try {
    const raw = readStorageItem("local", tableFilterStorageKey(boothCode));
    const parsed: unknown = raw ? JSON.parse(raw) : [];

    return Array.isArray(parsed)
      ? [...new Set(parsed.filter(isTableNumber))].sort((a, b) => a - b)
      : [];
  } catch {
    return [];
  }
};

export const writeTableFilter = (boothCode: string, tables: number[]): boolean =>
  writeStorageItem(
    "local",
    tableFilterStorageKey(boothCode),
    tables.length === 0 ? null : JSON.stringify(tables),
  );

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
