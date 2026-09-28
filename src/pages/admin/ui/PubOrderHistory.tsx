import { useState } from "react";

import { InteractionLoadingOverlay } from "@/shared/ui";

import { useAdminOrders } from "../api/getAdminOrders";
import { downloadOrderWorkbook } from "../lib/downloadOrderWorkbook";
import { formatWon } from "../lib/formatOrderText";
import {
  type AdminOrder,
  type AdminOrderStatus,
  adminOrderStatusLabels,
} from "../model/adminOrder";
import {
  buildOrderWorkbook,
  isRevenueOrder,
  orderWorkbookFileName,
} from "../model/orderWorkbook";
import { numberOrdersByArrival } from "../model/orderTiming";
import { useOrderStatusChange } from "../model/useOrderStatusChange";
import { OrderCancelDialog } from "./OrderCancelDialog";
import { OrderStatusError } from "./OrderStatusError";
import { PubOrderRow } from "./PubOrderRow";

type HistoryFilter = "ALL" | AdminOrderStatus;

const filters: HistoryFilter[] = [
  "ALL",
  "PENDING_DEPOSIT",
  "DEPOSIT_CLAIMED",
  "PAID",
  "COMPLETED",
  "CANCELED",
];

const filterLabel = (filter: HistoryFilter): string =>
  filter === "ALL" ? "전체" : adminOrderStatusLabels[filter];

type ExportState = "idle" | "working" | "failed";

interface PubOrderHistoryProps {
  pubName: string;
}

const sumAmount = (orders: AdminOrder[]): number =>
  orders.reduce((sum, order) => sum + order.totalPrice, 0);

// 지난 주문을 상태별로 찾아보고, 정산용 엑셀을 내려받는 화면. 결제완료 뒤의
// 취소처럼 입금 확인·주방 화면에서 하지 않는 처리도 여기서 한다.
export const PubOrderHistory = ({ pubName }: PubOrderHistoryProps) => {
  const orders = useAdminOrders();
  const statusChange = useOrderStatusChange();
  const [filter, setFilter] = useState<HistoryFilter>("ALL");
  const [exportState, setExportState] = useState<ExportState>("idle");

  const allOrders = orders.data ?? [];
  const revenueOrders = allOrders.filter(isRevenueOrder);
  const unpaidOrders = allOrders.filter(
    (order) => order.status === "PENDING_DEPOSIT" || order.status === "DEPOSIT_CLAIMED",
  );
  const canceledCount = allOrders.filter((order) => order.status === "CANCELED").length;
  const orderNumbers = numberOrdersByArrival(allOrders);

  // 최신 주문이 위로 온다. 방금 처리한 주문을 찾는 용도가 가장 많다.
  const visibleOrders = allOrders
    .filter((order) => filter === "ALL" || order.status === filter)
    .sort((left, right) => right.orderedAt.localeCompare(left.orderedAt));

  const onExport = async () => {
    setExportState("working");

    try {
      // 화면의 목록은 최대 5초 전 것이라 내려받기 직전에 다시 받는다.
      const latest = await orders.refetch({ throwOnError: true });
      const context = { exportedAt: new Date(), pubName };

      await downloadOrderWorkbook(
        buildOrderWorkbook(latest.data ?? [], context),
        orderWorkbookFileName(context),
      );
      setExportState("idle");
    } catch {
      setExportState("failed");
    }
  };

  const summaryItemClass = "flex flex-col gap-0.5 rounded-xl bg-[#262626] px-3 py-2.5";

  return (
    <section aria-label="주문 내역" className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3 px-1">
        <p className="text-xs text-[#a2a2a2]">매출은 결제완료·완료 주문만 합쳐요.</p>
        <button
          className="h-10 shrink-0 rounded-xl bg-[#00b37e] px-3 text-xs font-bold text-[#0b0b0b] disabled:opacity-60"
          disabled={!orders.isSuccess || exportState === "working"}
          onClick={() => void onExport()}
          type="button"
        >
          엑셀 내려받기
        </button>
      </div>

      {exportState === "failed" && (
        <p className="rounded-lg bg-[#3a2020] p-2 text-xs text-[#ff8b8b]">
          엑셀 파일을 만들지 못했어요. 잠시 뒤 다시 시도해 주세요.
        </p>
      )}

      {orders.isPending && (
        <p className="px-1 text-xs text-[#a2a2a2]">주문을 불러오는 중…</p>
      )}
      {orders.isError && (
        <p className="px-1 text-xs text-[#a2a2a2]">
          주문을 불러오지 못했어요. 5초 뒤 다시 시도해요.
        </p>
      )}

      {orders.isSuccess && (
        <dl className="grid grid-cols-2 gap-1.5 text-xs">
          <div className={summaryItemClass}>
            <dt className="text-[#a2a2a2]">매출</dt>
            <dd className="text-base font-bold text-[#fcfcfc] tabular-nums">
              {formatWon(sumAmount(revenueOrders))}
            </dd>
            <dd className="text-[#7a7a7a]">{revenueOrders.length}건</dd>
          </div>
          <div className={summaryItemClass}>
            <dt className="text-[#a2a2a2]">결제 확인 전</dt>
            <dd className="text-base font-bold text-[#fcfcfc] tabular-nums">
              {formatWon(sumAmount(unpaidOrders))}
            </dd>
            <dd className="text-[#7a7a7a]">{unpaidOrders.length}건</dd>
          </div>
          <div className={summaryItemClass}>
            <dt className="text-[#a2a2a2]">전체 주문</dt>
            <dd className="text-base font-bold text-[#fcfcfc]">{allOrders.length}건</dd>
          </div>
          <div className={summaryItemClass}>
            <dt className="text-[#a2a2a2]">취소</dt>
            <dd className="text-base font-bold text-[#fcfcfc]">{canceledCount}건</dd>
          </div>
        </dl>
      )}

      <OrderStatusError statusChange={statusChange} />

      <section aria-label="주문 목록" className="flex flex-col gap-1.5">
        {/* 필터는 한 줄로 두고 넘치면 옆으로 민다. 줄바꿈되면 목록이 그만큼 밀려난다. */}
        <div
          aria-label="주문 상태 필터"
          className="-mx-4 flex [scrollbar-width:none] gap-1.5 overflow-x-auto px-4 pb-1"
          role="group"
        >
          {filters.map((option) => (
            <button
              aria-pressed={filter === option}
              className={`h-8 shrink-0 rounded-full px-3 text-xs font-semibold ${
                filter === option
                  ? "bg-[#5d00ff] text-[#fcfcfc]"
                  : "bg-[#262626] text-[#a2a2a2]"
              }`}
              key={option}
              onClick={() => setFilter(option)}
              type="button"
            >
              {filterLabel(option)}
            </button>
          ))}
        </div>
        <p className="px-1 text-right text-[11px] text-[#7a7a7a]">최근 주문 순 ↓</p>

        {orders.isSuccess && visibleOrders.length === 0 ? (
          <p className="rounded-xl bg-[#262626] px-3 py-2.5 text-xs text-[#7a7a7a]">
            해당하는 주문이 없어요.
          </p>
        ) : (
          <div className="flex flex-col gap-1.5">
            {visibleOrders.map((order) => (
              <PubOrderRow
                isPending={statusChange.changeStatus.isPending}
                key={order.id}
                now={orders.dataUpdatedAt}
                onChangeStatus={statusChange.requestStatusChange}
                order={order}
                orderNumber={orderNumbers.get(order.id)}
                showStatus
              />
            ))}
          </div>
        )}
      </section>

      <OrderCancelDialog statusChange={statusChange} />

      {exportState === "working" && (
        <InteractionLoadingOverlay label="엑셀 파일을 만드는 중입니다" />
      )}
    </section>
  );
};
