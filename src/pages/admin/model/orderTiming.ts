import { type AdminOrder } from "./adminOrder";

export const numberOrdersByArrival = (orders: AdminOrder[]): Map<number, number> => {
  const sorted = [...orders].sort(
    (left, right) =>
      left.orderedAt.localeCompare(right.orderedAt) || left.id - right.id,
  );

  return new Map(sorted.map((order, index) => [order.id, index + 1]));
};

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
