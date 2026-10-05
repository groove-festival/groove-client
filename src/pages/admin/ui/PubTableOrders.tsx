import { ChevronDown } from "lucide-react";
import { useState } from "react";

import { useAdminOrders } from "../api/getAdminOrders";
import { formatWon } from "../lib/formatOrderText";
import {
  formatElapsed,
  minutesSince,
  numberOrdersByArrival,
} from "../model/orderTiming";
import {
  groupOrdersByTable,
  type TableOrders,
  type TableSort,
  tableSortLabels,
} from "../model/tableOrders";
import { useOrderStatusChange } from "../model/useOrderStatusChange";
import { OrderCancelDialog } from "./OrderCancelDialog";
import { OrderStatusError } from "./OrderStatusError";
import { PubOrderRow } from "./PubOrderRow";

const sorts: TableSort[] = ["number", "oldestLastOrder"];

interface PubTableOrdersProps {
  tableNumbers: number[];

  visibleTables: number[];
}

const TableSummary = ({ now, table }: { now: number; table: TableOrders }) => {
  if (table.activeCount === 0) {
    return (
      <span className="text-[#7a7a7a]">
        주문 없음{table.canceledCount > 0 && ` · 취소 ${table.canceledCount}건`}
      </span>
    );
  }

  return (
    <span>
      마지막 주문{" "}
      <span className="font-semibold text-[#fcfcfc]">
        {formatElapsed(minutesSince(table.lastOrderedAt, now))}
      </span>
      {` · ${table.activeCount}건 · ${formatWon(table.activeAmount)}`}
      {table.canceledCount > 0 && ` · 취소 ${table.canceledCount}건`}
    </span>
  );
};

export const PubTableOrders = ({
  tableNumbers,
  visibleTables,
}: PubTableOrdersProps) => {
  const orders = useAdminOrders();
  const statusChange = useOrderStatusChange();
  const [sort, setSort] = useState<TableSort>("number");
  const [openTables, setOpenTables] = useState<ReadonlySet<number>>(new Set());

  const allOrders = orders.data ?? [];
  const orderNumbers = numberOrdersByArrival(allOrders);
  const selected = new Set(visibleTables);
  const tables = groupOrdersByTable(allOrders, tableNumbers, sort).filter(
    (table) => selected.size === 0 || selected.has(table.tableNumber),
  );

  const toggleTable = (tableNumber: number) =>
    setOpenTables((previous) => {
      const next = new Set(previous);
      if (!next.delete(tableNumber)) {
        next.add(tableNumber);
      }
      return next;
    });

  return (
    <section aria-label="테이블별 주문" className="flex flex-col gap-3">
      <div aria-label="테이블 정렬" className="flex gap-1.5" role="group">
        {sorts.map((option) => (
          <button
            aria-pressed={sort === option}
            className={`h-8 shrink-0 rounded-full px-3 text-xs font-semibold ${
              sort === option
                ? "bg-[#5d00ff] text-[#fcfcfc]"
                : "bg-[#262626] text-[#a2a2a2]"
            }`}
            key={option}
            onClick={() => setSort(option)}
            type="button"
          >
            {tableSortLabels[option]}
          </button>
        ))}
      </div>

      {orders.isPending && (
        <p className="px-1 text-xs text-[#a2a2a2]">주문을 불러오는 중…</p>
      )}
      {orders.isError && (
        <p className="px-1 text-xs text-[#a2a2a2]">
          주문을 불러오지 못했어요. 5초 뒤 다시 시도해요.
        </p>
      )}

      <OrderStatusError statusChange={statusChange} />

      {orders.isSuccess && tables.length === 0 && (
        <p className="rounded-xl bg-[#262626] px-3 py-2.5 text-xs text-[#7a7a7a]">
          등록된 테이블이 없어요. 주막 설정에서 테이블을 만들어 주세요.
        </p>
      )}

      <ul className="flex flex-col gap-1.5">
        {tables.map((table) => {
          const isOpen = openTables.has(table.tableNumber);
          const panelId = `table-orders-${table.tableNumber}`;

          return (
            <li className="rounded-xl bg-[#262626]" key={table.tableNumber}>
              <button
                aria-controls={panelId}
                aria-expanded={isOpen}
                className="flex min-h-12 w-full items-center gap-3 px-3 py-2.5 text-left"
                onClick={() => toggleTable(table.tableNumber)}
                type="button"
              >
                <span className="w-12 shrink-0 text-base font-bold text-[#fcfcfc] tabular-nums">
                  {table.tableNumber}번
                </span>
                <span className="min-w-0 flex-1 truncate text-xs text-[#a2a2a2] tabular-nums">
                  {orders.isSuccess ? (
                    <TableSummary now={orders.dataUpdatedAt} table={table} />
                  ) : (
                    "—"
                  )}
                </span>
                <ChevronDown
                  aria-hidden="true"
                  className={`shrink-0 text-[#7a7a7a] transition-transform ${
                    isOpen ? "rotate-180" : ""
                  }`}
                  size={18}
                />
              </button>

              {isOpen && (
                <div className="flex flex-col gap-1.5 px-2 pb-2" id={panelId}>
                  {table.orders.length === 0 ? (
                    <p className="px-1 py-1 text-xs text-[#7a7a7a]">
                      이 테이블 주문이 아직 없어요.
                    </p>
                  ) : (
                    table.orders.map((order) => (
                      <PubOrderRow
                        isPending={statusChange.changeStatus.isPending}
                        key={order.id}
                        now={orders.dataUpdatedAt}
                        onChangeStatus={statusChange.requestStatusChange}
                        order={order}
                        orderNumber={orderNumbers.get(order.id)}
                        showStatus
                      />
                    ))
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>

      <OrderCancelDialog statusChange={statusChange} />
    </section>
  );
};
