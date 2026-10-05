import { ParticipantAvatar } from "./ParticipantAvatar";

interface ParticipantSelectChipProps {
  name: string;
  selected: boolean;
  disabled?: boolean;
  onClick?: () => void;
}

export function ParticipantSelectChip({
  name,
  selected,
  disabled = false,
  onClick,
}: ParticipantSelectChipProps) {
  return (
    <button
      aria-pressed={selected}
      className={`flex w-full items-center gap-6 rounded-2xl border bg-[#767676] px-5 py-3 disabled:cursor-default ${
        selected ? "border-[#fcfcfc]" : "border-[#a2a2a2]"
      }`}
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      <ParticipantAvatar className="size-14" dimmed={!selected} name={name} />
      <span
        className={`text-base font-semibold ${selected ? "text-[#fcfcfc]" : "text-[#a2a2a2]"}`}
      >
        {name}
      </span>
    </button>
  );
}
