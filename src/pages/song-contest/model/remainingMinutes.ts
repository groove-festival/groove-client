export function formatRemainingMinutes(endsAt: string | null, now: Date): string {
  if (!endsAt) return "0분 남음";

  const diffMs = new Date(endsAt).getTime() - now.getTime();
  const minutes = Math.max(0, Math.ceil(diffMs / 60_000));
  return `${minutes}분 남음`;
}
