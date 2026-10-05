export function isoToDateTimeLocal(iso: string | null | undefined): string {
  if (!iso) return "";
  return iso.slice(0, 16);
}

export function dateTimeLocalToIso(value: string): string | undefined {
  if (!value) return undefined;
  return `${value}:00`;
}
