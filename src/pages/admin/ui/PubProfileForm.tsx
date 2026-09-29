import { useState } from "react";

import { type Booth, BoothDepartments, formatOperatingDate } from "@/entities/booth";

import { useUpdatePubProfile } from "../api/updatePubProfile";
import { pubProfileErrorMessage } from "../model/adminErrorMessages";

const NAME_MAX = 40;
const DESCRIPTION_MAX = 200;

interface PubProfileFormProps {
  booth: Pick<
    Booth,
    "departments" | "description" | "name" | "operatingDate" | "spotDepartments"
  >;
}

// PUB-A15. 주막 이름과 한 줄 소개. 손님 목록 카드·상세·지도 라벨이 이 이름을 쓴다.
// 사범대처럼 한 자리를 날짜별로 나눠 쓰는 학과는 자기 날 주막만 바뀐다는 것을 함께 알린다.
export const PubProfileForm = ({ booth }: PubProfileFormProps) => {
  const updateProfile = useUpdatePubProfile();
  const [draft, setDraft] = useState<{ description: string; name: string } | null>(
    null,
  );

  const values = draft ?? { description: booth.description ?? "", name: booth.name };
  const name = values.name.trim();
  const isChanged =
    name !== booth.name.trim() ||
    values.description.trim() !== (booth.description ?? "").trim();
  const isValid =
    name.length > 0 &&
    name.length <= NAME_MAX &&
    values.description.trim().length <= DESCRIPTION_MAX;

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!isValid || !isChanged) return;

    updateProfile.mutate(
      { description: values.description.trim() || null, name },
      { onSuccess: () => setDraft(null) },
    );
  };

  return (
    <section
      aria-label="주막 정보"
      className="flex flex-col gap-3 rounded-2xl bg-[#262626] p-4"
    >
      <div className="flex flex-col gap-1">
        <h2 className="text-sm font-bold text-[#fcfcfc]">주막 정보</h2>
        <p className="text-xs text-[#a2a2a2]">손님 목록과 지도에 이 이름이 보여요.</p>
      </div>

      {booth.operatingDate && (
        <div
          className="flex flex-col gap-1 rounded-xl border border-[#cfff04] bg-[rgba(207,255,4,0.08)] p-3 text-xs leading-5 text-[#cfff04]"
          role="note"
        >
          <p className="font-semibold">
            우리 주막은 {formatOperatingDate(booth.operatingDate)}에 열어요.
          </p>
          <BoothDepartments booth={booth} className="text-[#fcfcfc]" />
          <p className="text-[#cfcfcf]">
            같은 자리를 다른 날 쓰는 학과와 메뉴·테이블·주문·계좌가 따로예요. 운영일에만
            손님 목록에 나오고 주문을 받아요.
          </p>
        </div>
      )}

      <form className="flex flex-col gap-2" onSubmit={onSubmit}>
        <label className="flex flex-col gap-1">
          <span className="text-xs text-[#a2a2a2]">주막 이름</span>
          <input
            className="h-10 rounded-xl bg-[#3a3a3a] px-3 text-sm text-[#fcfcfc] outline-none"
            maxLength={NAME_MAX}
            onChange={(event) => setDraft({ ...values, name: event.target.value })}
            type="text"
            value={values.name}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs text-[#a2a2a2]">한 줄 소개 (선택)</span>
          <input
            className="h-10 rounded-xl bg-[#3a3a3a] px-3 text-sm text-[#fcfcfc] outline-none"
            maxLength={DESCRIPTION_MAX}
            onChange={(event) =>
              setDraft({ ...values, description: event.target.value })
            }
            type="text"
            value={values.description}
          />
        </label>

        <button
          className="h-10 rounded-xl bg-[#5d00ff] text-sm font-semibold text-[#fcfcfc] disabled:opacity-60"
          disabled={!isValid || !isChanged || updateProfile.isPending}
          type="submit"
        >
          주막 정보 저장
        </button>
      </form>

      {updateProfile.isError && (
        <p className="rounded-lg bg-[#3a2020] p-2 text-xs text-[#ff8b8b]">
          {pubProfileErrorMessage(updateProfile.error)}
        </p>
      )}
      {updateProfile.isSuccess && draft === null && (
        <p className="text-xs text-[#00b37e]">주막 정보를 저장했어요.</p>
      )}
    </section>
  );
};
