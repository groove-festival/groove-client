import { ParticipantAvatar } from "./ParticipantAvatar";

interface ParticipantChipProps {
  name: string;

  muted?: boolean;

  winner?: boolean;
}

export function ParticipantChip({
  name,
  muted = false,
  winner = false,
}: ParticipantChipProps) {
  const toneClass = winner
    ? "border-[#ff0080] bg-[#d2066c]"
    : muted
      ? "border-[#a2a2a2] bg-[#767676]"
      : "border-[#fcfcfc] bg-[#767676]";

  return (
    <div
      className={`flex w-full min-w-0 items-center gap-2 rounded-2xl border px-2 py-3 ${toneClass}`}
    >
      <ParticipantAvatar className="size-12" dimmed={muted} name={name} />
      <span
        className={`text-base font-semibold ${muted ? "text-[#a2a2a2]" : "text-[#fcfcfc]"}`}
      >
        {name}
      </span>
    </div>
  );
}
