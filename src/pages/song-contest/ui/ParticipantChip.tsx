interface ParticipantChipProps {
  name: string;
  // 상대가 이미 확정됐거나(muted) 결과에서 진 참가자를 흐리게 표시할 때 쓴다.
  muted?: boolean;
}

// 경연 목록·경연 결과 카드에서 쓰는 참가자 표시. API가 사진을 내려주지 않아
// 원형 placeholder만 그린다.
export function ParticipantChip({ name, muted = false }: ParticipantChipProps) {
  return (
    <div
      className={`flex items-center gap-4 rounded-2xl border bg-[#767676] p-3 ${
        muted ? "border-[#a2a2a2]" : "border-[#fcfcfc]"
      }`}
    >
      <span
        aria-hidden="true"
        className={`size-14 shrink-0 rounded-full ${muted ? "bg-[#a2a2a2]" : "bg-[#fcfcfc]"}`}
      />
      <span
        className={`text-base font-semibold ${muted ? "text-[#a2a2a2]" : "text-[#fcfcfc]"}`}
      >
        {name}
      </span>
    </div>
  );
}
