import { useState } from "react";

import { useFestivalStatus } from "@/entities/festival";

import { useSetStageSchedule } from "../api/setStageSchedule";
import { stageScheduleErrorMessage } from "../model/adminErrorMessages";
import { dateTimeLocalToIso, isoToDateTimeLocal } from "../model/kstDateTimeInput";

const fieldLabels = {
  storyCollectionStartAt: "사연모집 시작",
  storyCollectionEndAt: "사연모집 종료",
  contestStartAt: "가요제 시작",
  contestEndAt: "가요제 종료",
} as const;

type FieldKey = keyof typeof fieldLabels;

// SING-A4. 네 값 모두 선택이며, 비어 있는 쪽의 단계는 fail-closed로
// BEFORE에 머문다 (§11-16).
export function StageScheduleForm() {
  const status = useFestivalStatus();
  const setSchedule = useSetStageSchedule();

  const [draft, setDraft] = useState<Record<FieldKey, string> | null>(null);

  const stage = status.data?.stage;
  const values: Record<FieldKey, string> =
    draft ??
    (stage
      ? {
          storyCollectionStartAt: isoToDateTimeLocal(stage.storyCollectionStartAt),
          storyCollectionEndAt: isoToDateTimeLocal(stage.storyCollectionEndAt),
          contestStartAt: isoToDateTimeLocal(stage.contestStartAt),
          contestEndAt: isoToDateTimeLocal(stage.contestEndAt),
        }
      : {
          storyCollectionStartAt: "",
          storyCollectionEndAt: "",
          contestStartAt: "",
          contestEndAt: "",
        });

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setSchedule.mutate({
      storyCollectionStartAt: dateTimeLocalToIso(values.storyCollectionStartAt),
      storyCollectionEndAt: dateTimeLocalToIso(values.storyCollectionEndAt),
      contestStartAt: dateTimeLocalToIso(values.contestStartAt),
      contestEndAt: dateTimeLocalToIso(values.contestEndAt),
    });
  };

  return (
    <section className="flex flex-col gap-3 rounded-2xl bg-[#262626] p-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-sm font-bold text-[#fcfcfc]">무대 일정</h2>
        <p className="text-xs text-[#a2a2a2]">
          {status.isPending && "현재 일정을 불러오는 중…"}
          {status.isError && "현재 일정을 불러오지 못했어요."}
          {stage && "비워두면 해당 단계는 시작 전 상태로 유지돼요."}
        </p>
      </div>

      <form className="flex flex-col gap-3" onSubmit={onSubmit}>
        {(Object.keys(fieldLabels) as FieldKey[]).map((key) => (
          <label className="flex flex-col gap-1 text-xs font-medium" key={key}>
            {fieldLabels[key]}
            <input
              className="h-10 rounded-lg border border-[#5d5d5d] bg-[#323232] px-3 text-sm text-[#fcfcfc] outline-none focus:border-[#00ffff]"
              onChange={(event) => setDraft({ ...values, [key]: event.target.value })}
              type="datetime-local"
              value={values[key]}
            />
          </label>
        ))}

        {setSchedule.isError && (
          <p className="text-xs text-[#ff5b5b]">
            {stageScheduleErrorMessage(setSchedule.error)}
          </p>
        )}
        {setSchedule.isSuccess && (
          <p className="text-xs text-[#7bffb0]">일정을 저장했어요.</p>
        )}

        <button
          className="h-10 rounded-lg bg-[#5d00ff] text-xs font-semibold text-[#fcfcfc] disabled:opacity-50"
          disabled={setSchedule.isPending}
          type="submit"
        >
          일정 저장
        </button>
      </form>
    </section>
  );
}
