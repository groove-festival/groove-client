import { useState } from "react";

import currencyCircleDollar from "../festival-visuals/currency-circle-dollar.svg";
import dialogClose from "../festival-visuals/dialog-close.svg";
import { normalizeDepositorName, type OrderAccount } from "../model/order";
import { CopyAccountNumberButton } from "./CopyAccountNumberButton";
import { DepositorNameField } from "./DepositorNameField";
import { OrderDialogFrame } from "./OrderDialogFrame";

interface BankTransferDialogProps {
  account: OrderAccount;
  onChooseCash: () => void;
  onClose: () => void;
  onSubmitDepositorName: (depositorName: string) => void;
}

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
      className="flex w-80 flex-col items-end gap-3 rounded-[36px] px-6 py-8"
      labelledBy="bank-transfer-dialog-title"
      onClose={onClose}
    >
      <button
        aria-label="계좌이체 안내 닫기"
        className="flex size-4 -translate-x-2 translate-y-1 items-center justify-center"
        onClick={onClose}
        type="button"
      >
        <img alt="" height={18} src={dialogClose} width={18} />
      </button>

      <div className="flex w-full flex-col items-center gap-4">
        <div className="flex w-full flex-col gap-6">
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

              <div className="flex w-full flex-col items-center gap-6">
                <div className="text-center text-base leading-6 font-bold">
                  <p className="flex items-center justify-center gap-1">
                    <span className="underline">
                      {account.bank} {account.accountNumber}
                    </span>
                    <CopyAccountNumberButton accountNumber={account.accountNumber} />
                  </p>
                  <p>{account.holder}</p>
                </div>

                <ul className="w-full list-disc space-y-[15px] pl-[18px] text-xs leading-[15px]">
                  {/* 줄바꿈은 <br />, 강조는 <strong className="font-bold">…</strong> */}
                  <li>
                    위 계좌로 <strong className="font-bold">주문 금액</strong>을 입금해
                    주세요.
                  </li>
                  <li>
                    직원이 <strong className="font-bold">입금자명을 확인 후 </strong>
                    조리가 시작됩니다.
                  </li>
                  <li>입금자명은 실제 이체한 이름과 일치해야 합니다.</li>
                  <li>
                    <strong className="font-bold">‘입금 확인중’</strong> 상태에서는
                    입금자명 수정이 가능합니다.
                  </li>
                </ul>
              </div>
            </div>

            <DepositorNameField onChange={setDepositorName} value={depositorName} />
          </div>

          <button
            className="h-14 w-full rounded-[12px] bg-[#cfff04] p-2.5 text-center text-base leading-[19px] font-semibold text-[#1c1c1c] transition-transform duration-150 ease-out active:scale-[0.97] disabled:active:scale-100 motion-reduce:transition-none"
            disabled={!normalizedDepositorName}
            onClick={() => onSubmitDepositorName(normalizedDepositorName)}
            type="button"
          >
            이체 완료
          </button>
        </div>

        <button
          className="text-xs leading-[14px] text-[#fcfcfc] underline"
          onClick={onChooseCash}
          type="button"
        >
          현금으로 결제하겠습니다
        </button>
      </div>
    </OrderDialogFrame>
  );
};
