import { ChevronDown } from "lucide-react";
import { useState } from "react";

import { formatOrderTime, formatWon } from "../lib/formatOrderText";
import {
  type AdminOrder,
  type AdminOrderStatus,
  adminOrderStatusLabels,
  adminOrderTransitionLabels,
  getAllowedAdminOrderTransitions,
} from "../model/adminOrder";
import { minutesSince, type WaitThresholds, waitToneOf } from "../model/orderTiming";
import { WaitChip } from "./WaitChip";

const statusToneClasses: Record<AdminOrderStatus, string> = {
  PENDING_DEPOSIT: "bg-[#4a4a4a] text-[#d4d4d4]",
  DEPOSIT_CLAIMED: "bg-[#5d00ff] text-[#fcfcfc]",
  PAID: "bg-[#00b37e] text-[#0b0b0b]",
  COMPLETED: "bg-[#3a3a3a] text-[#a2a2a2]",
  CANCELED: "bg-[#3a3a3a] text-[#a2a2a2]",
};

// 결제완료(돈 확인)와 서빙완료(음식 전달)는 누르는 사람과 뜻이 달라 색으로
// 구분한다. 결제완료는 결제완료 배지와 같은 초록, 서빙완료는 보라.
const primaryButtonClasses: Partial<Record<AdminOrderStatus, string>> = {
  PAID: "bg-[#00b37e] text-[#0b0b0b]",
  COMPLETED: "bg-[#5d00ff] text-[#fcfcfc]",
};

export interface PubOrderRowProps {
  isPending: boolean;
  now: number;
  onChangeStatus: (order: AdminOrder, status: AdminOrderStatus) => void;
  order: AdminOrder;
  orderNumber: number | undefined;
  // 목록이 이미 상태별로 묶여 있으면 상태 배지는 같은 말을 반복할 뿐이다.
  showStatus?: boolean;
  // 끝난 주문은 기다린 시간이 의미 없어 경과 칩을 숨긴다.
  waitThresholds?: WaitThresholds;
}

// 휴대폰에서 여러 주문을 한 화면에 훑을 수 있게 한 주문을 두 줄로 줄인 행.
// 입금 대사에 필요한 테이블·입금자명·금액·시각만 접힌 상태에 두고, 메뉴와
// 되돌릴 수 없는 취소는 행을 눌러 펼쳤을 때만 보인다. 다음 단계로 넘기는
// 버튼은 엄지가 닿는 오른쪽에 항상 둔다.
export const PubOrderRow = ({
  isPending,
  now,
  onChangeStatus,
  order,
  orderNumber,
  showStatus = false,
  waitThresholds,
}: PubOrderRowProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const transitions = getAllowedAdminOrderTransitions(order.status);
  const primary = transitions.find((status) => status !== "CANCELED");
  const canCancel = transitions.includes("CANCELED");
  const isCash = order.paymentMethod === "CASH";
  const minutes = minutesSince(order.orderedAt, now);
  const detailsId = `order-${order.id}-details`;

  return (
    <article
      aria-label={`주문 ${orderNumber ?? ""}번 · ${order.tableNumber}번 테이블`}
      className="rounded-xl bg-[#2c2c2c]"
    >
      <div className="flex items-center gap-2 py-2.5 pr-2.5 pl-3">
        <button
          aria-controls={detailsId}
          aria-expanded={isExpanded}
          className="flex min-w-0 flex-1 flex-col gap-1 text-left"
          onClick={() => setIsExpanded((expanded) => !expanded)}
          type="button"
        >
          <span className="flex w-full items-center gap-1.5">
            {orderNumber !== undefined && (
              <span className="shrink-0 text-[11px] font-semibold text-[#7a7a7a] tabular-nums">
                #{orderNumber}
              </span>
            )}
            <span className="shrink-0 text-sm font-bold text-[#fcfcfc]">
              {order.tableNumber}번 테이블
            </span>
            {showStatus && (
              <span
                className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold ${statusToneClasses[order.status]}`}
              >
                {adminOrderStatusLabels[order.status]}
              </span>
            )}
            {isCash && (
              <span className="shrink-0 rounded bg-[#ffb020] px-1.5 py-0.5 text-[10px] font-semibold text-[#0b0b0b]">
                현금
              </span>
            )}
            <span className="ml-auto shrink-0 text-sm font-bold text-[#fcfcfc] tabular-nums">
              {formatWon(order.totalPrice)}
            </span>
          </span>
          <span className="flex w-full items-center gap-1.5 text-xs">
            <span
              className={`min-w-0 truncate ${
                order.depositorName ? "font-semibold text-[#fcfcfc]" : "text-[#7a7a7a]"
              }`}
            >
              {order.depositorName ?? (isCash ? "현금 결제" : "미제출")}
            </span>
            <span className="shrink-0 text-[#7a7a7a] tabular-nums">
              {formatOrderTime(order.orderedAt)}
            </span>
            {waitThresholds && (
              <WaitChip minutes={minutes} tone={waitToneOf(minutes, waitThresholds)} />
            )}
            <ChevronDown
              aria-hidden="true"
              className={`ml-auto shrink-0 text-[#7a7a7a] transition-transform ${
                isExpanded ? "rotate-180" : ""
              }`}
              size={16}
            />
          </span>
        </button>

        {primary && (
          <button
            className={`h-11 shrink-0 rounded-lg px-3 text-xs font-bold disabled:opacity-60 ${primaryButtonClasses[primary]}`}
            disabled={isPending}
            onClick={() => onChangeStatus(order, primary)}
            type="button"
          >
            {adminOrderTransitionLabels[primary]}
          </button>
        )}
      </div>

      {isExpanded && (
        <div
          className="flex flex-col gap-2 border-t border-[#3a3a3a] px-3 pt-2 pb-3"
          id={detailsId}
        >
          <ul className="flex flex-col gap-0.5 text-xs text-[#d4d4d4]">
            {order.lines.map((line) => (
              <li className="flex justify-between gap-2" key={line.menuId}>
                <span className="truncate">
                  {line.name} × {line.quantity}
                </span>
                <span className="shrink-0 text-[#a2a2a2] tabular-nums">
                  {formatWon(line.price * line.quantity)}
                </span>
              </li>
            ))}
          </ul>
          {order.depositorSubmittedAt && (
            <p className="text-[11px] text-[#7a7a7a]">
              입금자명 제출 {formatOrderTime(order.depositorSubmittedAt)}
            </p>
          )}
          {canCancel && (
            <button
              className="h-9 self-start rounded-lg bg-[#3a3a3a] px-3 text-xs font-semibold text-[#ff8b8b] disabled:opacity-60"
              disabled={isPending}
              onClick={() => onChangeStatus(order, "CANCELED")}
              type="button"
            >
              {adminOrderTransitionLabels.CANCELED}
            </button>
          )}
        </div>
      )}
    </article>
  );
};
