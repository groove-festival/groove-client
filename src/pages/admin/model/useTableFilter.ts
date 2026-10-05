import { useState } from "react";

import { readTableFilter, writeTableFilter } from "./tableFilter";

export function useTableFilter(boothCode: string) {
  const [tables, setTables] = useState<number[]>(() => readTableFilter(boothCode));

  const changeTables = (next: number[]) => {
    const normalized = [...new Set(next)].sort((a, b) => a - b);
    setTables(normalized);
    writeTableFilter(boothCode, normalized);
  };

  return { changeTables, tables };
}
