import { appendAnalyticsScriptOnce } from "./appendAnalyticsScript";

type ClarityCommand = ((...args: unknown[]) => void) & {
  q?: unknown[][];
};

declare global {
  interface Window {
    clarity?: ClarityCommand;
  }
}

export function initializeClarity(projectId: string): void {
  if (!/^[a-z0-9]+$/i.test(projectId)) {
    return;
  }

  if (!window.clarity) {
    const clarity: ClarityCommand = (...args: unknown[]) => {
      clarity.q ??= [];
      clarity.q.push(args);
    };
    window.clarity = clarity;
  }

  appendAnalyticsScriptOnce(
    "groove-microsoft-clarity",
    `https://www.clarity.ms/tag/${encodeURIComponent(projectId)}`,
  );
}
