import { CalendarDays } from "lucide-react";
import { useRef, useState } from "react";

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
export type StageScheduleSection = "stories" | "votes";

const sectionContent: Record<
  StageScheduleSection,
  { fields: FieldKey[]; title: string; submitLabel: string; successMessage: string }
> = {
  stories: {
    fields: ["storyCollectionStartAt", "storyCollectionEndAt"],
    title: "사연 모집 일정",
    submitLabel: "사연 모집 일정 저장",
    successMessage: "사연 모집 일정을 저장했어요.",
  },
  votes: {
    fields: ["contestStartAt", "contestEndAt"],
    title: "가요제 진행 일정",
    submitLabel: "가요제 일정 저장",
    successMessage: "가요제 일정을 저장했어요.",
  },
};

// SING-A4. 네 값 모두 선택이며, 비어 있는 쪽의 단계는 fail-closed로
// BEFORE에 머문다 (§11-16). 화면에서는 사연·투표 일정을 나눠 보여주지만,
// 저장할 때는 반대쪽 기존 값도 함께 보내 탭 간 데이터가 지워지지 않게 한다.
export function StageScheduleForm({ section }: { section: StageScheduleSection }) {
  const status = useFestivalStatus();
  const setSchedule = useSetStageSchedule();
  const content = sectionContent[section];
  const inputRefs = useRef<Partial<Record<FieldKey, HTMLInputElement | null>>>({});

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
        <h2 className="text-sm font-bold text-[#fcfcfc]">{content.title}</h2>
        <p className="text-xs text-[#a2a2a2]">
          {status.isPending && "현재 일정을 불러오는 중…"}
          {status.isError && "현재 일정을 불러오지 못했어요."}
          {stage && "비워두면 해당 단계는 시작 전 상태로 유지돼요."}
        </p>
      </div>

      <form className="flex flex-col gap-3" onSubmit={onSubmit}>
        {content.fields.map((key) => {
          const inputId = `stage-schedule-${key}`;

          return (
            <div className="flex flex-col gap-1 text-xs font-medium" key={key}>
              <label htmlFor={inputId}>{fieldLabels[key]}</label>
              <span className="relative">
                <input
                  className="h-10 w-full rounded-lg border border-[#5d5d5d] bg-[#323232] px-3 pr-11 text-sm text-[#fcfcfc] outline-none focus:border-[#00ffff] [&::-webkit-calendar-picker-indicator]:hidden"
                  id={inputId}
                  onChange={(event) =>
                    setDraft({ ...values, [key]: event.target.value })
                  }
                  ref={(element) => {
                    inputRefs.current[key] = element;
                  }}
                  style={{ colorScheme: "dark" }}
                  type="datetime-local"
                  value={values[key]}
                />
                <button
                  aria-label={`${fieldLabels[key]} 달력 열기`}
                  className="absolute top-1/2 right-1 flex size-8 -translate-y-1/2 items-center justify-center rounded-md text-[#a2a2a2] hover:bg-[#454545] hover:text-[#fcfcfc] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#00ffff]"
                  onClick={() => {
                    const input = inputRefs.current[key];
                    input?.focus();
                    input?.showPicker?.();
                  }}
                  type="button"
                >
                  <CalendarDays aria-hidden="true" size={18} strokeWidth={1.8} />
                </button>
              </span>
            </div>
          );
        })}

        {setSchedule.isError && (
          <p className="text-xs text-[#ff5b5b]">
            {stageScheduleErrorMessage(setSchedule.error)}
          </p>
        )}
        {setSchedule.isSuccess && (
          <p className="text-xs text-[#7bffb0]">{content.successMessage}</p>
        )}

        <button
          className="h-10 rounded-lg bg-[#5d00ff] text-xs font-semibold text-[#fcfcfc] disabled:opacity-50"
          disabled={setSchedule.isPending}
          type="submit"
        >
          {content.submitLabel}
        </button>
      </form>
    </section>
  );
}
