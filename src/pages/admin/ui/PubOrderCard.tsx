import { formatOrderTime, formatWon } from "../lib/formatOrderText";
import {
  type AdminOrder,
  type AdminOrderStatus,
  adminOrderStatusLabels,
  adminOrderTransitionLabels,
  getAllowedAdminOrderTransitions,
} from "../model/adminOrder";

const statusToneClasses: Record<AdminOrderStatus, string> = {
  PENDING_DEPOSIT: "bg-[#4a4a4a] text-[#d4d4d4]",
  DEPOSIT_CLAIMED: "bg-[#5d00ff] text-[#fcfcfc]",
  PAID: "bg-[#00b37e] text-[#0b0b0b]",
  COMPLETED: "bg-[#3a3a3a] text-[#a2a2a2]",
  CANCELED: "bg-[#3a3a3a] text-[#a2a2a2]",
};

export interface PubOrderCardProps {
  isHighlighted?: boolean;
  isPending: boolean;
  onChangeStatus: (order: AdminOrder, status: AdminOrderStatus) => void;
  order: AdminOrder;
}

export const PubOrderCard = ({
  isHighlighted = false,
  isPending,
  onChangeStatus,
  order,
}: PubOrderCardProps) => {
  const transitions = getAllowedAdminOrderTransitions(order.status);
  const isCash = order.paymentMethod === "CASH";

  return (
    <article
      className={`flex flex-col gap-3 rounded-xl p-3 ${
        isHighlighted ? "bg-[#332154] ring-1 ring-[#5d00ff]" : "bg-[#323232]"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-bold text-[#fcfcfc]">
              {order.tableNumber}번 테이블
            </span>
            <span
              className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${statusToneClasses[order.status]}`}
            >
              {adminOrderStatusLabels[order.status]}
            </span>
            {isCash && (
              <span className="rounded bg-[#ffb020] px-1.5 py-0.5 text-[10px] font-semibold text-[#0b0b0b]">
                현금
              </span>
            )}
          </div>
          <p className="text-xs text-[#a2a2a2]">
            주문 {formatOrderTime(order.orderedAt)}
          </p>
        </div>
        <p className="text-sm font-bold text-[#fcfcfc]">
          {formatWon(order.totalPrice)}
        </p>
      </div>

      <dl className="flex flex-col gap-1 border-t border-[#4a4a4a] pt-2 text-xs">
        <div className="flex gap-2">
          <dt className="shrink-0 text-[#a2a2a2]">입금자명</dt>
          <dd
            className={
              order.depositorName ? "font-semibold text-[#fcfcfc]" : "text-[#7a7a7a]"
            }
          >
            {order.depositorName ?? (isCash ? "현금 결제" : "미제출")}
          </dd>
        </div>
        {order.depositorSubmittedAt && (
          <div className="flex gap-2">
            <dt className="shrink-0 text-[#a2a2a2]">제출</dt>
            <dd className="text-[#d4d4d4]">
              {formatOrderTime(order.depositorSubmittedAt)}
            </dd>
          </div>
        )}
      </dl>

      <ul className="flex flex-col gap-0.5 text-xs text-[#d4d4d4]">
        {order.lines.map((line) => (
          <li className="flex justify-between gap-2" key={line.menuId}>
            <span className="truncate">
              {line.name} × {line.quantity}
            </span>
            <span className="shrink-0 text-[#a2a2a2]">
              {formatWon(line.price * line.quantity)}
            </span>
          </li>
        ))}
      </ul>

      {transitions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {transitions.map((status) => (
            <button
              className={`h-9 rounded-lg px-3 text-xs font-semibold disabled:opacity-60 ${
                status === "CANCELED"
                  ? "bg-[#4a4a4a] text-[#ff8b8b]"
                  : "bg-[#5d00ff] text-[#fcfcfc]"
              }`}
              disabled={isPending}
              key={status}
              onClick={() => onChangeStatus(order, status)}
              type="button"
            >
              {adminOrderTransitionLabels[status]}
            </button>
          ))}
        </div>
      )}
    </article>
  );
};
