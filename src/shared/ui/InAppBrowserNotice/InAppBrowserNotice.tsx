import { Check, Copy } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

interface InAppBrowserNoticeProps {
  unavailableMessage: ReactNode;
  browserInstruction?: string;
  className?: string;
  showIosSafariLocationGuide?: boolean;
}

interface IosSafariLocationGuideProps {
  className?: string;
}

type CopyState = "idle" | "copied" | "failed";

const COPY_STATE_RESET_MS = 3_000;

export const IosSafariLocationGuide = ({
  className = "",
}: IosSafariLocationGuideProps) => (
  <div className={`text-left text-[#cfcfcf] ${className}`}>
    <p className="text-[10px] leading-[14px] font-semibold text-[#fcfcfc]">
      아이폰 iOS의 경우(사파리) 위치 허용 방법:
    </p>
    <p className="text-[9px] leading-[14px] tracking-[-0.02em]">
      <span className="block whitespace-nowrap">설정 앱 → 개인정보 보호 및 보안</span>
      <span className="block whitespace-nowrap">
        → 위치 서비스 → Safari 웹사이트에서 설정
      </span>
    </p>
  </div>
);

const copyWithLegacyFallback = (value: string): boolean => {
  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.readOnly = true;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.append(textarea);
  textarea.select();

  try {
    return document.execCommand("copy");
  } finally {
    textarea.remove();
  }
};

const copyCurrentAddress = async (): Promise<void> => {
  const address = window.location.href;

  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(address);
      return;
    } catch {
      // 일부 인앱 브라우저는 Clipboard API 를 노출하고도 호출을 거부한다.
    }
  }

  if (!copyWithLegacyFallback(address)) {
    throw new Error("Current page address could not be copied");
  }
};

export const InAppBrowserNotice = ({
  browserInstruction = "브라우저로 접속해 주세요.",
  className = "",
  showIosSafariLocationGuide = false,
  unavailableMessage,
}: InAppBrowserNoticeProps) => {
  const [copyState, setCopyState] = useState<CopyState>("idle");
  const resetTimerRef = useRef<number | undefined>(undefined);

  useEffect(
    () => () => {
      window.clearTimeout(resetTimerRef.current);
    },
    [],
  );

  const handleCopy = async () => {
    window.clearTimeout(resetTimerRef.current);

    try {
      await copyCurrentAddress();
      setCopyState("copied");
    } catch {
      setCopyState("failed");
    }

    resetTimerRef.current = window.setTimeout(
      () => setCopyState("idle"),
      COPY_STATE_RESET_MS,
    );
  };

  const isCopied = copyState === "copied";

  return (
    <aside
      className={`flex w-full flex-col items-center gap-3 rounded-2xl border border-white/20 bg-[rgba(28,28,28,0.58)] px-4 py-3 text-center text-[#fcfcfc] backdrop-blur-xl ${className}`}
    >
      <div className="space-y-1">
        <p className="text-sm leading-5 font-semibold">{unavailableMessage}</p>
        <p className="text-xs leading-4 text-[#cfcfcf]">{browserInstruction}</p>
      </div>

      {showIosSafariLocationGuide && (
        <IosSafariLocationGuide className="w-full border-t border-white/15 pt-2" />
      )}

      <button
        className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl bg-[#fcfcfc] px-4 py-2 text-sm font-semibold text-[#1c1c1c] transition-transform duration-150 ease-out active:scale-[0.98] motion-reduce:transition-none"
        onClick={handleCopy}
        type="button"
      >
        {isCopied ? (
          <Check aria-hidden="true" className="size-4" strokeWidth={2.2} />
        ) : (
          <Copy aria-hidden="true" className="size-4" strokeWidth={2.2} />
        )}
        {isCopied ? "주소를 복사했어요" : "주소 복사"}
      </button>

      {copyState === "failed" && (
        <p aria-live="polite" className="text-xs text-[#ffb4b4]" role="status">
          주소를 복사하지 못했어요.
        </p>
      )}
    </aside>
  );
};
