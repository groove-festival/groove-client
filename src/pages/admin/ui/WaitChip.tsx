import { formatElapsed, type WaitTone } from "../model/orderTiming";

const toneClasses: Record<WaitTone, string> = {
  fresh: "bg-[#1f3a2f] text-[#5fe0a8]",
  waiting: "bg-[#3d3217] text-[#ffc542]",
  late: "bg-[#4a1f1f] text-[#ff8b8b]",
};

interface WaitChipProps {
  minutes: number | null;
  tone: WaitTone;
}

// 얼마나 기다렸는지를 색으로 먼저 읽히게 한다. 초록 → 노랑 → 빨강.
export const WaitChip = ({ minutes, tone }: WaitChipProps) => (
  <span
    className={`shrink-0 rounded px-1.5 py-0.5 text-[11px] leading-none font-semibold ${toneClasses[tone]}`}
  >
    {formatElapsed(minutes)}
  </span>
);
