import { Fragment, useState } from "react";

import { type BoothDepositAccount } from "@/entities/booth";

import currencyCircleDollar from "../festival-visuals/currency-circle-dollar.svg";
import dialogClose from "../festival-visuals/dialog-close.svg";
import { normalizeDepositorName } from "../model/order";
import { CopyAccountNumberButton } from "./CopyAccountNumberButton";
import { DepositorNameField } from "./DepositorNameField";
import { OrderDialogFrame } from "./OrderDialogFrame";

interface BankTransferDialogProps {
  account: BoothDepositAccount;
  onChooseCash: () => void;
  onClose: () => void;
  onSubmitDepositorName: (depositorName: string) => void;
}

// 디자인에서 줄을 직접 나눈 문구는 같은 위치에서 줄바꿈한다.
const transferNotices = [
  ["위 계좌번호로 해당 금액을 입금하면 결제가", "완료됩니다."],
  ["아래에 입금자명을 입력하시면 직원이 이체 확인 후 결제 및 주문 완료가 됩니다 ."],
  ["입금자명 작성 시 실제 이체 시 사용된 성함과", "정확하게 일치하여야 합니다."],
  ["‘입금 확인중' 상태일 동안 수정 및 재제출이 가능합니다."],
];

export const BankTransferDialog = ({
  account,
  onChooseCash,
  onClose,
  onSubmitDepositorName,
}: BankTransferDialogProps) => {
  const [depositorName, setDepositorName] = useState("");
  const normalizedDepositorName = normalizeDepositorName(depositorName);

  return (
    <OrderDialogFrame
      className="flex w-80 flex-col items-end gap-3 rounded-[36px] px-7 py-8"
      labelledBy="bank-transfer-dialog-title"
      onClose={onClose}
    >
      <button
        aria-label="계좌이체 안내 닫기"
        className="flex size-4 items-center justify-center"
        onClick={onClose}
        type="button"
      >
        <img alt="" height={18} src={dialogClose} width={18} />
      </button>

      <div className="flex w-64 flex-col items-center gap-3">
        <div className="flex w-full flex-col gap-10">
          <div className="flex w-full flex-col gap-6">
            <div className="flex w-full flex-col items-center gap-7 text-[#fcfcfc]">
              <div className="flex w-[213px] flex-col items-center gap-3">
                <img alt="" height={72} src={currencyCircleDollar} width={72} />
                <h1
                  className="w-full text-center text-2xl leading-[29px] font-semibold"
                  id="bank-transfer-dialog-title"
                >
                  계좌이체 안내
                </h1>
              </div>

              <div className="flex flex-col items-center gap-6">
                <div className="text-center text-base leading-6 font-bold">
                  <p className="flex items-center justify-center gap-1">
                    <span className="underline">
                      {account.bank} {account.accountNumber}
                    </span>
                    <CopyAccountNumberButton accountNumber={account.accountNumber} />
                  </p>
                  <p>{account.holder}</p>
                </div>

                <ul className="w-[244px] list-disc space-y-[15px] pl-[18px] text-xs leading-[15px]">
                  {transferNotices.map((lines) => (
                    <li key={lines.join(" ")}>
                      {lines.map((line, index) => (
                        <Fragment key={line}>
                          {index > 0 && <br />}
                          {line}
                        </Fragment>
                      ))}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <DepositorNameField onChange={setDepositorName} value={depositorName} />
          </div>

          <button
            className="h-14 w-full rounded-2xl bg-[#cfff04] p-2.5 text-center text-base leading-[19px] font-semibold text-[#1c1c1c]"
            disabled={!normalizedDepositorName}
            onClick={() => onSubmitDepositorName(normalizedDepositorName)}
            type="button"
          >
            이체 완료
          </button>
        </div>

        <button
          className="text-xs leading-[14px] text-[#494949] underline"
          onClick={onChooseCash}
          type="button"
        >
          현금으로 결제하겠습니다
        </button>
      </div>
    </OrderDialogFrame>
  );
};
