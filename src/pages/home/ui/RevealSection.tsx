import type { ReactNode } from "react";

import { useSectionReveal } from "../model/useSectionReveal";

interface RevealSectionProps {
  children: ReactNode;
  id?: string;
  label: string;

  delayMs?: number;
}

export const RevealSection = ({
  children,
  id,
  label,
  delayMs = 0,
}: RevealSectionProps) => {
  const { ref, isRevealed } = useSectionReveal<HTMLElement>();

  return (
    <section
      aria-label={label}
      className={`flex w-full scroll-mt-20 flex-col gap-6 transition-[opacity,translate] duration-700 ease-out motion-reduce:translate-y-0 motion-reduce:opacity-100 motion-reduce:transition-none ${
        isRevealed ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
      }`}
      id={id}
      ref={ref}
      style={{ transitionDelay: isRevealed ? `${delayMs}ms` : undefined }}
    >
      <h2 className="text-2xl leading-[normal] font-bold text-[#fcfcfc]">{label}</h2>
      {children}
    </section>
  );
};
