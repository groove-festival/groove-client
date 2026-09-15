export function appendAnalyticsScriptOnce(id: string, source: string): void {
  if (document.getElementById(id)) {
    return;
  }

  const script = document.createElement("script");
  script.id = id;
  script.async = true;
  script.src = source;
  script.referrerPolicy = "strict-origin-when-cross-origin";
  document.head.append(script);
}
