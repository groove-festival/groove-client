import { type BoothStatus } from "@/entities/booth";

import { useChangePubStatus } from "../api/changePubStatus";
import { pubStatusErrorMessage } from "../model/adminErrorMessages";

export interface PubStatusToggleProps {
  hasAccount: boolean;
  status: BoothStatus;
}

const statusOptions: { label: string; value: BoothStatus }[] = [
  { label: "오픈", value: "OPEN" },
  { label: "준비중", value: "PREPARING" },
];

// PUB-A2. 준비중이면 손님 주문이 즉시 막힌다. 계좌가 없으면 오픈해도 주문이
// 409(PUB006)로 거부되므로 먼저 경고한다.
export const PubStatusToggle = ({ hasAccount, status }: PubStatusToggleProps) => {
  const changeStatus = useChangePubStatus();

  return (
    <section className="flex flex-col gap-3 rounded-2xl bg-[#262626] p-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-sm font-bold text-[#fcfcfc]">주막 상태</h2>
        <p className="text-xs text-[#a2a2a2]">
          준비중으로 바꾸면 손님이 주문할 수 없고 메뉴판만 보여요.
        </p>
      </div>

      <div className="flex gap-2" role="group">
        {statusOptions.map((option) => (
          <button
            aria-pressed={status === option.value}
            className={`h-10 flex-1 rounded-xl text-sm font-semibold disabled:opacity-60 ${
              status === option.value
                ? "bg-[#5d00ff] text-[#fcfcfc]"
                : "bg-[#3a3a3a] text-[#a2a2a2]"
            }`}
            disabled={changeStatus.isPending || status === option.value}
            key={option.value}
            onClick={() => changeStatus.mutate(option.value)}
            type="button"
          >
            {option.label}
          </button>
        ))}
      </div>

      {!hasAccount && (
        <p className="rounded-lg bg-[#3a2020] p-2 text-xs text-[#ff8b8b]">
          계좌가 등록되지 않아 지금은 손님이 주문할 수 없어요. 아래에서 먼저 계좌를
          등록해 주세요.
        </p>
      )}

      {changeStatus.isError && (
        <p className="rounded-lg bg-[#3a2020] p-2 text-xs text-[#ff8b8b]">
          {pubStatusErrorMessage(changeStatus.error)}
        </p>
      )}
    </section>
  );
};
