export function normalizeBasePath(value: string) {
  const normalized = `/${value.trim().replace(/^\/+|\/+$/g, "")}`;
  return normalized === "/" ? "/" : normalized;
}
