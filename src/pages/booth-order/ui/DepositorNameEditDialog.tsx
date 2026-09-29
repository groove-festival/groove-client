import { useState } from "react";

import { normalizeDepositorName } from "../model/order";
import { DepositorNameField } from "./DepositorNameField";
import { OrderDialogFrame } from "./OrderDialogFrame";

interface DepositorNameEditDialogProps {
  initialDepositorName: string;
  onCancel: () => void;
  onSubmit: (depositorName: string) => void;
}

export const DepositorNameEditDialog = ({
  initialDepositorName,
  onCancel,
  onSubmit,
}: DepositorNameEditDialogProps) => {
  const [depositorName, setDepositorName] = useState(initialDepositorName);
  const normalizedDepositorName = normalizeDepositorName(depositorName);

  return (
    <OrderDialogFrame
      className="flex flex-col items-center gap-6 rounded-[36px] px-6 py-6"
      labelledBy="depositor-name-edit-title"
      onClose={onCancel}
    >
      <h1
        className="text-center text-base leading-[19px] font-bold text-[#fcfcfc]"
        id="depositor-name-edit-title"
      >
        입금자명 수정
      </h1>
      <DepositorNameField onChange={setDepositorName} value={depositorName} />
      <div className="flex items-center gap-4">
        <button
          className="w-[120px] rounded-[12px] bg-[rgba(252,252,252,0.3)] px-5 py-3 text-base leading-[19px] font-semibold text-[#fcfcfc] transition-transform duration-150 ease-out active:scale-[0.97] motion-reduce:transition-none"
          onClick={onCancel}
          type="button"
        >
          취소
        </button>
        <button
          className="w-[120px] rounded-[12px] bg-[#cfff04] px-5 py-3 text-base leading-[19px] font-semibold text-[#1c1c1c] transition-transform duration-150 ease-out active:scale-[0.97] disabled:active:scale-100 motion-reduce:transition-none"
          disabled={!normalizedDepositorName}
          onClick={() => onSubmit(normalizedDepositorName)}
          type="button"
        >
          완료
        </button>
      </div>
    </OrderDialogFrame>
  );
};
