import { useState } from "react";

import { type AdminPubAccount } from "../api/getAdminPub";
import { useUpdatePubAccount } from "../api/updatePubAccount";
import { pubAccountErrorMessage } from "../model/adminErrorMessages";

export interface PubAccountFormProps {
  account: AdminPubAccount | null;
}

const fieldLabels = {
  bankName: "은행명",
  accountNumber: "계좌번호",
  accountHolder: "예금주",
} as const;

type FieldKey = keyof typeof fieldLabels;

const emptyValues: Record<FieldKey, string> = {
  bankName: "",
  accountNumber: "",
  accountHolder: "",
};

// PUB-A3. 여기 등록한 계좌가 손님의 주문 완료 모달에 복사 가능한 형태로
// 노출된다. 세 항목이 모두 차 있어야 저장한다 — 하나라도 비면 손님이 이체할
// 수 없는 계좌가 된다.
export const PubAccountForm = ({ account }: PubAccountFormProps) => {
  const updateAccount = useUpdatePubAccount();
  const [draft, setDraft] = useState<Record<FieldKey, string> | null>(null);

  const values = draft ?? (account ? { ...account } : emptyValues);
  const isComplete = (Object.keys(fieldLabels) as FieldKey[]).every((key) =>
    values[key].trim(),
  );

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!isComplete) {
      return;
    }

    updateAccount.mutate(
      {
        accountHolder: values.accountHolder.trim(),
        accountNumber: values.accountNumber.trim(),
        bankName: values.bankName.trim(),
      },
      { onSuccess: () => setDraft(null) },
    );
  };

  return (
    <section className="flex flex-col gap-3 rounded-2xl bg-[#262626] p-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-sm font-bold text-[#fcfcfc]">대표자 계좌</h2>
        <p className="text-xs text-[#a2a2a2]">
          {account
            ? "손님의 주문 완료 화면에 이 계좌가 보여요."
            : "계좌를 등록해야 손님이 주문할 수 있어요."}
        </p>
      </div>

      <form className="flex flex-col gap-2" onSubmit={onSubmit}>
        {(Object.keys(fieldLabels) as FieldKey[]).map((key) => (
          <label className="flex flex-col gap-1" key={key}>
            <span className="text-xs text-[#a2a2a2]">{fieldLabels[key]}</span>
            <input
              className="h-10 rounded-xl bg-[#3a3a3a] px-3 text-sm text-[#fcfcfc] outline-none"
              inputMode={key === "accountNumber" ? "numeric" : "text"}
              onChange={(event) => setDraft({ ...values, [key]: event.target.value })}
              type="text"
              value={values[key]}
            />
          </label>
        ))}

        <button
          className="h-10 rounded-xl bg-[#5d00ff] text-sm font-semibold text-[#fcfcfc] disabled:opacity-60"
          disabled={!isComplete || updateAccount.isPending}
          type="submit"
        >
          {account ? "계좌 수정" : "계좌 등록"}
        </button>
      </form>

      {updateAccount.isError && (
        <p className="rounded-lg bg-[#3a2020] p-2 text-xs text-[#ff8b8b]">
          {pubAccountErrorMessage(updateAccount.error)}
        </p>
      )}
      {updateAccount.isSuccess && draft === null && (
        <p className="text-xs text-[#00b37e]">계좌를 저장했어요.</p>
      )}
    </section>
  );
};
