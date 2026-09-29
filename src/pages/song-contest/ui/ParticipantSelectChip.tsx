interface ParticipantSelectChipProps {
  name: string;
  selected: boolean;
  disabled?: boolean;
  onClick?: () => void;
}

// 결선(3자 대결) 투표 전용 가로형 선택 칩. 2자 대결의 큰 정사각 타일
// (ParticipantTile)과 달리 3명을 세로로 쌓아야 해서 더 컴팩트한 가로형을
// 쓴다 (Figma 1441-15791, 1441-15852).
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
      <span
        aria-hidden="true"
        className={`size-14 shrink-0 rounded-full ${selected ? "bg-[#fcfcfc]" : "bg-[#a2a2a2]"}`}
      />
      <span
        className={`text-base font-semibold ${selected ? "text-[#fcfcfc]" : "text-[#a2a2a2]"}`}
      >
        {name}
      </span>
    </button>
  );
}
