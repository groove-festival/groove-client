// "n분 남음" 표시용. 종료 시각이 없거나(미개시) 이미 지났으면 0분으로 고정한다.
export function formatRemainingMinutes(endsAt: string | null, now: Date): string {
  if (!endsAt) return "0분 남음";

  const diffMs = new Date(endsAt).getTime() - now.getTime();
  const minutes = Math.max(0, Math.ceil(diffMs / 60_000));
  return `${minutes}분 남음`;
}
