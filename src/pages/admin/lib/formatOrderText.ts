export const formatWon = (amount: number): string =>
  `${amount.toLocaleString("ko-KR")}원`;

// 동명이인·동일 금액이 겹치면 주문 시각으로 구분해야 하므로(FR-1.8-2) 초까지
// 보여준다.
const timeFormatter = new Intl.DateTimeFormat("ko-KR", {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});

// 서버가 오프셋 없는 형식으로 주는 시각이 섞일 수 있어, 읽지 못하면 비워
// 두고 화면을 깨뜨리지 않는다.
export const formatOrderTime = (isoTime: string | null): string => {
  if (!isoTime) {
    return "—";
  }

  const parsed = new Date(isoTime);

  return Number.isNaN(parsed.getTime()) ? "—" : timeFormatter.format(parsed);
};
