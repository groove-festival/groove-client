import { useState } from "react";

import {
  type AdminRivalScore,
  type RivalsCollege,
  useAddRivalScore,
  useAdminRivalScores,
} from "../api/rivalScores";
import { rivalScoreErrorMessage } from "../model/adminErrorMessages";
import { AdminHeader } from "./AdminHeader";
import { ConfirmDialog } from "./ConfirmDialog";

const colleges: { id: RivalsCollege; label: string }[] = [
  { id: "IT", label: "IT대학" },
  { id: "NURSING", label: "간호대학" },
  { id: "ART", label: "예술대학" },
  { id: "SOCIAL", label: "사회과학대학" },
  { id: "EDU", label: "사범대학" },
  { id: "NATURE", label: "자연과학대학" },
];

const quickPoints = [10, 50, 100] as const;

const formatPoints = (points: number) => `${points > 0 ? "+" : ""}${points}점`;

export function PlanAdminDashboard() {
  const scores = useAdminRivalScores();
  const addScore = useAddRivalScore();
  const [college, setCollege] = useState<RivalsCollege | null>(null);
  const [pointsInput, setPointsInput] = useState("");
  const [reason, setReason] = useState("");
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [lastResult, setLastResult] = useState<string | null>(null);

  const points = Number(pointsInput);
  const isValidPoints =
    pointsInput.trim() !== "" &&
    Number.isInteger(points) &&
    points !== 0 &&
    Math.abs(points) <= 100_000;
  const collegeLabel = colleges.find((item) => item.id === college)?.label ?? "";
  const scoreOf = new Map(
    (scores.data?.scores ?? []).map((entry: AdminRivalScore) => [entry.college, entry]),
  );

  const confirm = () => {
    if (!college) return;
    setIsConfirmOpen(false);
    addScore.mutate(
      { college, points, reason: reason.trim() || null },
      {
        onSuccess: (result) => {
          setLastResult(
            `${collegeLabel} ${formatPoints(points)} 반영 → 현재 ${result.score}점`,
          );
          setPointsInput("");
          setReason("");
        },
      },
    );
  };

  return (
    <div className="min-h-dvh">
      <AdminHeader title="GROOVE RIVALS 관리자" />
      <div className="flex flex-col gap-4 px-4 py-6">
        <section
          aria-label="RIVALS 점수판"
          className="flex flex-col gap-2 rounded-2xl bg-[#262626] p-4"
        >
          <h2 className="text-sm font-bold text-[#fcfcfc]">현재 점수판</h2>
          {scores.isPending && (
            <p className="text-xs text-[#a2a2a2]">점수판을 불러오는 중…</p>
          )}
          {scores.isError && (
            <p className="text-xs text-[#a2a2a2]">
              점수판을 불러오지 못했어요. 5초 뒤 다시 시도해요.
            </p>
          )}
          {scores.data && (
            <ol className="flex flex-col gap-1">
              {scores.data.scores.map((entry) => (
                <li
                  className="flex items-center justify-between rounded-lg bg-[#1c1c1c] px-3 py-2 text-sm"
                  key={entry.college}
                >
                  <span className="text-[#fcfcfc]">
                    <span className="mr-2 font-bold text-[#00ffff] tabular-nums">
                      {entry.rank}위
                    </span>
                    {entry.collegeName}
                  </span>
                  <span className="font-semibold text-[#fcfcfc] tabular-nums">
                    {entry.score}점
                  </span>
                </li>
              ))}
            </ol>
          )}
        </section>

        <section
          aria-label="점수 입력"
          className="flex flex-col gap-3 rounded-2xl bg-[#262626] p-4"
        >
          <div className="flex flex-col gap-1">
            <h2 className="text-sm font-bold text-[#fcfcfc]">점수 입력</h2>
            <p className="text-xs text-[#a2a2a2]">
              입력한 점수만큼 더해져요. 잘못 넣었으면 같은 단대에 음수(예: -50)로 빼
              주세요.
            </p>
          </div>

          <div aria-label="단대 선택" className="grid grid-cols-2 gap-2" role="group">
            {colleges.map((item) => (
              <button
                aria-pressed={college === item.id}
                className={`flex h-12 flex-col items-center justify-center rounded-xl text-sm font-semibold ${
                  college === item.id
                    ? "bg-[#5d00ff] text-[#fcfcfc]"
                    : "bg-[#3a3a3a] text-[#d4d4d4]"
                }`}
                key={item.id}
                onClick={() => setCollege(item.id)}
                type="button"
              >
                {item.label}
                <span className="text-[10px] font-normal tabular-nums opacity-80">
                  {scoreOf.has(item.id) ? `${scoreOf.get(item.id)?.score}점` : ""}
                </span>
              </button>
            ))}
          </div>

          <label className="flex flex-col gap-1">
            <span className="text-xs text-[#a2a2a2]">점수 (빼려면 -)</span>
            <input
              className="h-11 rounded-xl bg-[#3a3a3a] px-3 text-base text-[#fcfcfc] outline-none"
              inputMode="numeric"
              onChange={(event) => setPointsInput(event.target.value)}
              placeholder="예: 50"
              type="text"
              value={pointsInput}
            />
          </label>
          <div aria-label="빠른 점수" className="flex gap-2" role="group">
            {quickPoints.map((value) => (
              <button
                className="h-9 flex-1 rounded-lg bg-[#3a3a3a] text-xs font-semibold text-[#fcfcfc]"
                key={value}
                onClick={() => setPointsInput(String(value))}
                type="button"
              >
                +{value}
              </button>
            ))}
            <button
              className="h-9 flex-1 rounded-lg bg-[#3a2020] text-xs font-semibold text-[#ff8b8b]"
              disabled={!isValidPoints}
              onClick={() => setPointsInput(String(-points))}
              type="button"
            >
              ± 부호 바꾸기
            </button>
          </div>

          <label className="flex flex-col gap-1">
            <span className="text-xs text-[#a2a2a2]">사유 (선택)</span>
            <input
              className="h-11 rounded-xl bg-[#3a3a3a] px-3 text-sm text-[#fcfcfc] outline-none"
              maxLength={200}
              onChange={(event) => setReason(event.target.value)}
              placeholder="예: 1차 미션 1위"
              type="text"
              value={reason}
            />
          </label>

          {addScore.isError && (
            <p
              className="rounded-lg bg-[#3a2020] p-2 text-xs text-[#ff8b8b]"
              role="alert"
            >
              {rivalScoreErrorMessage(addScore.error)}
            </p>
          )}
          {lastResult && !addScore.isError && (
            <p className="text-xs text-[#7bffb0]" role="status">
              {lastResult}
            </p>
          )}

          <button
            className="h-11 rounded-xl bg-[#5d00ff] text-sm font-semibold text-[#fcfcfc] disabled:opacity-50"
            disabled={!college || !isValidPoints || addScore.isPending}
            onClick={() => setIsConfirmOpen(true)}
            type="button"
          >
            {addScore.isPending ? "반영하는 중…" : "점수 반영"}
          </button>
        </section>
      </div>

      <ConfirmDialog
        confirmLabel="반영"
        danger={points < 0}
        description={`${collegeLabel}에 ${formatPoints(points)}${
          reason.trim() ? ` (${reason.trim()})` : ""
        }을 반영해요. 점수는 누적돼요.`}
        onCancel={() => setIsConfirmOpen(false)}
        onConfirm={confirm}
        open={isConfirmOpen}
        title="점수를 반영할까요?"
      />
    </div>
  );
}
