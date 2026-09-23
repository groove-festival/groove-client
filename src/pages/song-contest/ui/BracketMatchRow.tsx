import type { Vote } from "@/entities/contest";

import { ParticipantChip } from "./ParticipantChip";

interface BracketMatchRowProps {
  vote: Vote;
  // 제목 옆 보조 텍스트("n분 남음" 등). 경연 결과 목록에서는 생략한다.
  metaLabel?: string;
  // 경연 결과 카드에서만 우승자 배지를 보여준다. 피그마 원본엔 우승 표시가
  // 없어 이 배지는 요청에 따라 추가한 부분이다.
  showWinnerBadge?: boolean;
}

export function BracketMatchRow({
  vote,
  metaLabel,
  showWinnerBadge = false,
}: BracketMatchRowProps) {
  // 3라운드(결선)만 1·2·3위를 가리는 3자 대결이라 참가팀이 3명이다. 그 외에는
  // 항상 2명(VS)이거나, 앞 라운드 결과가 아직 없어 빈 배열이다.
  const isMultiWay = vote.participants.length > 2;

  return (
    <div className="flex w-full flex-col gap-3">
      <div className="flex items-center justify-between text-[#fcfcfc]">
        <p className="text-xl font-bold">{vote.title}</p>
        {metaLabel && <p className="text-xs font-medium text-[#fcfcfc]">{metaLabel}</p>}
      </div>

      {vote.participants.length === 0 ? (
        <p className="w-full rounded-2xl border border-[#a2a2a2] bg-[#767676] p-4 text-center text-sm text-[#a2a2a2]">
          아직 참가팀이 정해지지 않았어요
        </p>
      ) : isMultiWay ? (
        <div className="flex flex-col gap-2">
          {vote.participants.map((participant) => (
            <div className="flex items-center gap-2" key={participant.voteParticipantId}>
              <ParticipantChip name={participant.name} />
              {showWinnerBadge && participant.resultRank === 1 && <WinnerBadge />}
            </div>
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center gap-3">
          <div className="flex items-center gap-2">
            <ParticipantChip name={vote.participants[0].name} />
            {showWinnerBadge && vote.participants[0].resultRank === 1 && (
              <WinnerBadge />
            )}
          </div>
          <span className="w-[22px] text-xl font-medium text-[#fcfcfc]">vs</span>
          <div className="flex items-center gap-2">
            <ParticipantChip name={vote.participants[1].name} />
            {showWinnerBadge && vote.participants[1].resultRank === 1 && (
              <WinnerBadge />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function WinnerBadge() {
  return (
    <span className="rounded-full bg-[#ff0080] px-3 py-2 text-xs font-medium text-[#fcfcfc] shadow-[0_0_2px_#ff0080]">
      우승
    </span>
  );
}
