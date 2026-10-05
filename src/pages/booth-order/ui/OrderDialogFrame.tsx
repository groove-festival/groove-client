import { useRef, type ReactNode } from "react";

import { useDialogLifecycle } from "@/shared/ui";

interface OrderDialogFrameProps {
  children: ReactNode;
  className: string;
  labelledBy: string;
  onClose: () => void;
}

export const OrderDialogFrame = ({
  children,
  className,
  labelledBy,
  onClose,
}: OrderDialogFrameProps) => {
  const dialogRef = useRef<HTMLElement>(null);
  useDialogLifecycle({ dialogRef, onDismiss: onClose });

  return (
    <div className="fixed top-0 left-1/2 z-[70] h-dvh w-full max-w-[600px] -translate-x-1/2 overflow-y-auto bg-[rgba(28,28,28,0.5)] backdrop-blur-[24px]">
      <div className="flex min-h-full items-center justify-center px-4 py-6">
        <section
          aria-labelledby={labelledBy}
          aria-modal="true"
          className={`bg-[rgba(252,252,252,0.5)] backdrop-blur-[4px] ${className}`}
          ref={dialogRef}
          tabIndex={-1}
          role="dialog"
        >
          {children}
        </section>
      </div>
    </div>
  );
};
