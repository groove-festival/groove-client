import { ParticipantAvatar } from "./ParticipantAvatar";

interface ParticipantChipProps {
  name: string;
  // 상대가 이미 확정됐거나(muted) 결과에서 진 참가자를 흐리게 표시할 때 쓴다.
  muted?: boolean;
  // 좁은 카드(가요제 상단 "경연 결과" 탭)에서는 배지가 오른쪽 참가자일 때
  // 잘려서, 배지 대신 칩 색으로 우승을 나타낼 때 쓴다.
  winner?: boolean;
}

// 경연 목록·경연 결과 카드에서 쓰는 참가자 표시. 사진은 팀 이름으로 찾는다
// (model/teamPhotos).
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
