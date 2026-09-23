interface ParticipantTileProps {
  name: string;
  selected: boolean;
  disabled?: boolean;
  onClick?: () => void;
}

// "진행 중인 투표"/"참여한 투표" 카드에서 쓰는 큰 선택형 참가자 타일.
export function ParticipantTile({
  name,
  selected,
  disabled = false,
  onClick,
}: ParticipantTileProps) {
  return (
    <button
      aria-pressed={selected}
      className={`flex min-h-[174px] w-[138px] flex-col items-center justify-center gap-6 rounded-3xl border bg-[#767676] px-7 py-8 ${
        selected ? "border-[#fcfcfc]" : "border-[#a2a2a2]"
      } disabled:cursor-default`}
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      <span
        aria-hidden="true"
        className={`size-20 shrink-0 rounded-full ${selected ? "bg-[#fcfcfc]" : "bg-[#a2a2a2]"}`}
      />
      <span
        className={`text-base font-semibold ${selected ? "text-[#fcfcfc]" : "text-[#a2a2a2]"}`}
      >
        {name}
      </span>
    </button>
  );
}
