import { DotSpinner } from "./DotSpinner";

interface InteractionLoadingOverlayProps {
  label?: string;
}

export const InteractionLoadingOverlay = ({
  label = "처리 중입니다",
}: InteractionLoadingOverlayProps) => {
  return (
    <div
      aria-label={label}
      aria-live="polite"
      className="fixed inset-0 z-[60] flex items-center justify-center bg-[#1c1c1c]/45 backdrop-blur-[2px]"
      role="status"
    >
      <DotSpinner />
    </div>
  );
};
