export const formatWon = (amount: number): string =>
  `${amount.toLocaleString("ko-KR")}원`;

const timeFormatter = new Intl.DateTimeFormat("ko-KR", {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});

export const formatOrderTime = (isoTime: string | null): string => {
  if (!isoTime) {
    return "—";
  }

  const parsed = new Date(isoTime);

  return Number.isNaN(parsed.getTime()) ? "—" : timeFormatter.format(parsed);
};
