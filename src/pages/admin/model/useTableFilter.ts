import { useState } from "react";

import { readTableFilter, writeTableFilter } from "./tableFilter";

// 담당 테이블 선택과 그 기기 저장을 한 흐름으로 묶는다.
export function useTableFilter(boothCode: string) {
  const [tables, setTables] = useState<number[]>(() => readTableFilter(boothCode));

  const changeTables = (next: number[]) => {
    const normalized = [...new Set(next)].sort((a, b) => a - b);
    setTables(normalized);
    writeTableFilter(boothCode, normalized);
  };

  return { changeTables, tables };
}
