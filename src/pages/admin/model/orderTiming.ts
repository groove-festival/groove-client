import { type AdminOrder } from "./adminOrder";

// 주문 목록을 휴대폰으로 훑어볼 때 "무엇이 먼저 들어왔고 얼마나 기다렸는지"를
// 카드 순서만으로 읽기는 어렵다. 주막 안에서의 도착 순번과 경과 시간을 따로
// 계산해 행마다 붙인다.

// 주막 안에서 들어온 순서대로 1부터 매긴 번호. 서버의 orderId는 전 주막이
// 함께 쓰는 값이라 손님·직원이 부르기에 크고 띄엄띄엄하다. 서버가 전 상태의
// 주문을 내려주므로 취소된 주문도 번호를 차지해, 새 주문이 들어와도 기존
// 번호가 바뀌지 않는다.
export const numberOrdersByArrival = (orders: AdminOrder[]): Map<number, number> => {
  const sorted = [...orders].sort(
    (left, right) =>
      left.orderedAt.localeCompare(right.orderedAt) || left.id - right.id,
  );

  return new Map(sorted.map((order, index) => [order.id, index + 1]));
};

// 기준 시각부터 몇 분이 지났는지. 시각을 못 읽거나 아직 폴링 기준 시각이
// 없으면(0) null — 모르는 값을 "0분"으로 보여주지 않는다.
export const minutesSince = (isoTime: string | null, now: number): number | null => {
  if (!isoTime || now === 0) {
    return null;
  }

  const parsed = Date.parse(isoTime);

  return Number.isNaN(parsed) ? null : Math.max(0, Math.floor((now - parsed) / 60_000));
};

export type WaitTone = "fresh" | "waiting" | "late";

export interface WaitThresholds {
  lateAt: number;
  waitingAt: number;
}

// 입금 대사는 10분(FR-1.8-2의 강조 기준), 조리는 20분을 넘기면 늦은 것으로 본다.
export const PAYMENT_WAIT: WaitThresholds = { waitingAt: 5, lateAt: 10 };
export const KITCHEN_WAIT: WaitThresholds = { waitingAt: 10, lateAt: 20 };

export const waitToneOf = (
  minutes: number | null,
  { lateAt, waitingAt }: WaitThresholds,
): WaitTone => {
  if (minutes === null || minutes < waitingAt) {
    return "fresh";
  }

  return minutes >= lateAt ? "late" : "waiting";
};

export const formatElapsed = (minutes: number | null): string => {
  if (minutes === null) {
    return "—";
  }

  if (minutes < 1) {
    return "방금";
  }

  return minutes < 60
    ? `${minutes}분 전`
    : `${Math.floor(minutes / 60)}시간 ${minutes % 60}분 전`;
};
