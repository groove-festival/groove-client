const wonFormatter = new Intl.NumberFormat("ko-KR");

export const formatWon = (amount: number) => `${wonFormatter.format(amount)}원`;
