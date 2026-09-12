import { useState } from "react";

import {
  type PlaylistPhase,
  playlistPhases,
  useFestivalStatus,
} from "@/entities/festival";
import { ApiError } from "@/shared/api";

import { useChangePhaseOverride } from "../api/changePhaseOverride";
import { ConfirmDialog } from "./ConfirmDialog";

const phaseLabels: Record<PlaylistPhase, string> = {
  BEFORE_OPEN: "접수 전",
  SUBMISSION: "접수 중",
  SELECTION: "선정 중",
  PUBLISHED: "공개",
};

const overrideErrorMessage = (error: unknown): string => {
  if (error instanceof ApiError) {
    if (error.code === "C001") {
      return "단계 값이 올바르지 않아요.";
    }
    if (error.code === "C003" || error.code === "C004") {
      return "권한이 없어요. 다시 로그인해 주세요.";
    }
  }
  return "단계 변경에 실패했어요. 잠시 후 다시 시도해 주세요.";
};

// null = 자동 판정으로 되돌리기.
type PendingTarget = PlaylistPhase | null;

export const PhaseOverridePanel = () => {
  const status = useFestivalStatus();
  const override = useChangePhaseOverride();
  const [pending, setPending] = useState<{ target: PendingTarget } | null>(null);

  const appliedPhase = override.data?.phase ?? status.data?.playlist?.phase;
  const overrideValue = override.data?.phaseOverride;
  const overrideKnown = override.isSuccess;

  const apply = () => {
    if (!pending) {
      return;
    }
    const { target } = pending;
    setPending(null);
    override.mutate(target);
  };

  const confirmText =
    pending == null
      ? ""
      : pending.target === null
        ? "자동 판정(일시 기준)으로 되돌립니다."
        : `단계를 "${phaseLabels[pending.target]}"(으)로 강제합니다.`;

  return (
    <section className="flex flex-col gap-3 rounded-2xl bg-[#262626] p-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-sm font-bold text-[#fcfcfc]">플레이리스트 단계</h2>
        <p className="text-xs text-[#a2a2a2]">
          {status.isPending && "현재 단계를 불러오는 중…"}
          {status.isError && "현재 단계를 불러오지 못했어요."}
          {appliedPhase && (
            <>
              현재 적용:{" "}
              <span className="font-semibold text-[#fcfcfc]">
                {phaseLabels[appliedPhase]}
              </span>{" "}
              ·{" "}
              {overrideKnown
                ? overrideValue == null
                  ? "자동 판정"
                  : `수동 override (${phaseLabels[overrideValue]})`
                : "override 상태는 변경 후 표시돼요"}
            </>
          )}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {playlistPhases.map((phase) => (
          <button
            className="h-10 rounded-lg bg-[#3a3a3a] text-xs font-semibold text-[#fcfcfc] disabled:opacity-50"
            disabled={override.isPending}
            key={phase}
            onClick={() => setPending({ target: phase })}
            type="button"
          >
            {phaseLabels[phase]} 단계로
          </button>
        ))}
      </div>
      <button
        className="h-10 rounded-lg border border-[#5d5d5d] text-xs font-semibold text-[#fcfcfc] disabled:opacity-50"
        disabled={override.isPending}
        onClick={() => setPending({ target: null })}
        type="button"
      >
        자동 판정으로 되돌리기
      </button>

      {override.isError && (
        <p className="text-xs text-[#ff5b5b]">{overrideErrorMessage(override.error)}</p>
      )}

      <ConfirmDialog
        description={confirmText}
        onCancel={() => setPending(null)}
        onConfirm={apply}
        open={pending !== null}
        title="단계를 변경할까요?"
      />
    </section>
  );
};
