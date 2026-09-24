// datetime-local <input>은 오프셋 없는 로컬 시각 문자열만 다룬다. 관리자는
// 전부 KST 현장에서 접속하므로 별도 변환 없이 그대로 쓴다. SING-A4 요청
// 본문은 (문서 예시와 달리) 오프셋 없는 시각을 받는다 — openapi.json 예시
// 확인 및 실서버 응답으로 검증됨(2026-09-23).
export function isoToDateTimeLocal(iso: string | null | undefined): string {
  if (!iso) return "";
  return iso.slice(0, 16);
}

export function dateTimeLocalToIso(value: string): string | undefined {
  if (!value) return undefined;
  return `${value}:00`;
}
