import { type ReactNode } from "react";

import { type BoothDepositAccount } from "@/entities/booth";

import { formatWon } from "../lib/formatWon";
import { type PlacedOrder } from "../model/order";
import { CopyAccountNumberButton } from "./CopyAccountNumberButton";

interface OrderReceiptProps {
  account: BoothDepositAccount;
  boothName: string;
  canCopyAccountNumber?: boolean;
  order: PlacedOrder;
}

const ReceiptRow = ({
  children,
  isEmphasized = false,
  label,
}: {
  children: ReactNode;
  isEmphasized?: boolean;
  label: string;
}) => (
  <div className="flex items-start text-base leading-6">
    <dt className="w-[98px] shrink-0 font-semibold text-[#1c1c1c]">{label}</dt>
    <dd
      className={
        isEmphasized ? "font-semibold text-[#1c1c1c]" : "min-w-0 text-[#494949]"
      }
    >
      {children}
    </dd>
  </div>
);

// 영수증 모양의 주문 내역. 현금 주문은 입금자명·계좌 번호 없이 주막명·주문
// 메뉴·결제 금액만 보여준다.
export const OrderReceipt = ({
  account,
  boothName,
  canCopyAccountNumber = false,
  order,
}: OrderReceiptProps) => {
  const isTransfer = order.paymentMethod === "TRANSFER";

  return (
    <section aria-labelledby="order-receipt-title" className="relative">
      <div aria-hidden="true" className="relative h-8 rounded-[20.5px] bg-[#fcfcfc]">
        <div className="absolute top-[13px] left-1/2 h-2 w-[346px] max-w-[calc(100%-15px)] -translate-x-1/2 rounded-[20.5px] bg-[#494949]" />
      </div>

      <div
        className={`relative mx-auto -mt-[19px] w-[330px] max-w-[calc(100%-31px)] bg-gradient-to-b from-[#cfcfcf] to-[#fcfcfc] to-[3.365%] px-[18.5px] pt-[26px] ${
          isTransfer ? "pb-[46px]" : "pb-[52px]"
        }`}
      >
        <h2
          className="text-xl leading-6 font-bold text-[#1c1c1c]"
          id="order-receipt-title"
        >
          주문 내역
        </h2>

        <dl className="mt-4 flex flex-col gap-3">
          <ReceiptRow label="주막명">{boothName}</ReceiptRow>
          {isTransfer && order.depositorName && (
            <ReceiptRow label="입금자명">
              <span data-clarity-mask="true">{order.depositorName}</span>
            </ReceiptRow>
          )}
          <ReceiptRow label="주문 메뉴">
            <ul className="list-disc pl-6">
              {order.lines.map((line) => (
                <li key={line.menuId}>
                  {line.name}({formatWon(line.price)})
                  {line.quantity > 1 && ` x ${line.quantity}`}
                </li>
              ))}
            </ul>
          </ReceiptRow>
          <ReceiptRow isEmphasized label="결제 금액">
            {formatWon(order.totalPrice)}
          </ReceiptRow>
          {isTransfer && (
            <ReceiptRow label="계좌 번호">
              <span className="inline-flex items-center gap-1 whitespace-nowrap">
                {account.bank} {account.accountNumber}
                {canCopyAccountNumber && (
                  <CopyAccountNumberButton accountNumber={account.accountNumber} />
                )}
              </span>
              <span className="block">{account.holder}</span>
            </ReceiptRow>
          )}
        </dl>
      </div>
    </section>
  );
};
