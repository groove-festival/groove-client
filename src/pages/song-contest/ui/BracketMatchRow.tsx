import { Fragment } from "react";

import type { Vote } from "@/entities/contest";

import { ParticipantChip } from "./ParticipantChip";

interface BracketMatchRowProps {
  vote: Vote;
  // 제목 옆 보조 텍스트("n분 남음" 등). 경연 결과 목록에서는 생략한다.
  metaLabel?: string;
  // 우승 표시 방식. "badge"는 칩 위에 배지를 얹고(밑 섹션 "경연 결과" 카드),
  // "color"는 배지 없이 칩 색으로만 나타낸다(위 섹션 "경연 결과" 탭 — 카드
  // 폭이 좁아 오른쪽 참가자일 때 배지가 잘리는 문제가 있었다). 생략하면
  // 우승 표시를 하지 않는다.
  winnerDisplay?: "badge" | "color";
}

export function BracketMatchRow({ vote, metaLabel, winnerDisplay }: BracketMatchRowProps) {
  // 3라운드(결선)만 1·2·3위를 가리는 3자 대결이라 참가팀이 3명이다. 그 외에는
  // 항상 2명(VS)이거나, 앞 라운드 결과가 아직 없어 빈 배열이다.
  const isMultiWay = vote.participants.length > 2;
  const isWinner = (resultRank: number | null) =>
    winnerDisplay !== undefined && resultRank === 1;

  return (
    <div className="flex w-full flex-col gap-3">
      <div className="flex items-center justify-between text-[#fcfcfc]">
        <p className="text-xl font-semibold">{vote.title}</p>
        {metaLabel && <p className="text-xs font-medium text-[#fcfcfc]">{metaLabel}</p>}
      </div>

      {vote.participants.length === 0 ? (
        <p className="w-full rounded-2xl border border-[#a2a2a2] bg-[#767676] p-4 text-center text-sm text-[#a2a2a2]">
          아직 참가팀이 정해지지 않았어요
        </p>
      ) : isMultiWay ? (
        <div className="flex flex-col items-center gap-2">
          {vote.participants.map((participant, index) => (
            <Fragment key={participant.voteParticipantId}>
              <div className="relative w-full">
                <ParticipantChip
                  name={participant.name}
                  winner={winnerDisplay === "color" && isWinner(participant.resultRank)}
                />
                {winnerDisplay === "badge" && isWinner(participant.resultRank) && (
                  <WinnerBadge />
                )}
              </div>
              {index < vote.participants.length - 1 && (
                <span className="text-xl font-medium text-[#fcfcfc]">vs</span>
              )}
            </Fragment>
          ))}
        </div>
      ) : (
        <div className="flex w-full items-center justify-center gap-2">
          <div className="relative min-w-0 flex-1">
            <ParticipantChip
              name={vote.participants[0].name}
              winner={winnerDisplay === "color" && isWinner(vote.participants[0].resultRank)}
            />
            {winnerDisplay === "badge" && isWinner(vote.participants[0].resultRank) && (
              <WinnerBadge />
            )}
          </div>
          <span className="shrink-0 text-xl font-medium text-[#fcfcfc]">vs</span>
          <div className="relative min-w-0 flex-1">
            <ParticipantChip
              name={vote.participants[1].name}
              winner={winnerDisplay === "color" && isWinner(vote.participants[1].resultRank)}
            />
            {winnerDisplay === "badge" && isWinner(vote.participants[1].resultRank) && (
              <WinnerBadge />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// 참가자 칩 우측 상단에 덧대는 우승 배지. flex 행에서 텍스트와 너비를 다투지
// 않도록 칩 위에 절대 위치로 얹는다(칩·부모에 position: relative 필요).
function WinnerBadge() {
  return (
    <span className="absolute -top-2 -right-2 rounded-full bg-[#ff0080] px-3 py-2 text-xs font-medium text-[#fcfcfc] shadow-[0_0_2px_#ff0080]">
      우승
    </span>
  );
}
