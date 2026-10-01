import { useEffect } from "react";
import { createPortal } from "react-dom";

import locationIcon from "../festival-visuals/location-icon.webp";

export function VoteLocationFindingOverlay() {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  return createPortal(
    <div
      aria-atomic="true"
      aria-label="현재 위치를 찾고 있어요"
      aria-live="polite"
      className="fixed top-0 left-1/2 z-[80] flex h-dvh w-full max-w-[600px] -translate-x-1/2 items-center justify-center overflow-hidden bg-[rgba(28,28,28,0.5)] px-6 backdrop-blur-[10px]"
      role="status"
    >
      <div className="flex -translate-y-5 flex-col items-center text-center text-[#fcfcfc]">
        <div aria-hidden="true" className="relative size-[280px]">
          <div className="absolute inset-0 animate-[ping_2.8s_cubic-bezier(0,0,0.2,1)_infinite] rounded-full border border-[#00ffff]/25 opacity-0 motion-reduce:animate-none" />
          <div
            className="absolute inset-8 animate-[ping_2.8s_cubic-bezier(0,0,0.2,1)_infinite] rounded-full border border-[#ff0080]/30 opacity-0 motion-reduce:animate-none"
            style={{ animationDelay: "900ms" }}
          />

          <div className="absolute inset-7 overflow-hidden rounded-full border border-white/10 bg-[radial-gradient(circle,rgba(93,0,255,0.16)_0%,rgba(0,255,255,0.06)_48%,transparent_70%)]">
            <div className="absolute inset-[20%] rounded-full border border-white/10" />
            <div className="absolute inset-[38%] rounded-full border border-white/10" />
            <div className="absolute top-1/2 right-2 left-2 h-px bg-white/10" />
            <div className="absolute top-2 bottom-2 left-1/2 w-px bg-white/10" />
            <div className="absolute inset-0 animate-[spin_3s_linear_infinite] rounded-full bg-[conic-gradient(from_0deg,transparent_0deg,transparent_292deg,rgba(0,255,255,0.06)_320deg,rgba(0,255,255,0.48)_360deg)] motion-reduce:animate-none" />
          </div>

          <div className="absolute inset-0 flex items-center justify-center">
            <img
              alt=""
              className="animate-float h-[155px] w-[168px] object-contain drop-shadow-[0_0_24px_rgba(255,0,128,0.38)] motion-reduce:animate-none"
              src={locationIcon}
            />
          </div>
        </div>

        <h2 className="mt-1 text-xl font-bold tracking-[-0.02em]">
          현재 위치를 찾고 있어요
        </h2>
        <p className="mt-2 text-sm leading-5 text-[#cfcfcf]">
          투표 가능한 장소인지 확인하고 있어요
          <br />
          잠시만 기다려주세요
        </p>
      </div>
    </div>,
    document.body,
  );
}
