import { FallbackAction } from "./FallbackAction";
import { fallbackContent } from "./fallbackContent";
import type { FallbackScreenProps } from "./types";

export const FallbackScreen = ({
  action,
  className = "",
  variant,
}: FallbackScreenProps) => {
  const content = fallbackContent[variant];

  return (
    <main
      className={`font-pretendard flex min-h-dvh w-full items-center justify-center bg-[#1c1c1c] text-center text-[#fcfcfc] ${className}`}
    >
      <section className="flex w-[226px] flex-col items-center gap-6">
        <img
          alt=""
          className="h-[185px] w-[193px] shrink-0 object-contain"
          src={content.illustration}
        />
        <div className="flex w-full flex-col items-center gap-4">
          <h1
            aria-label={content.messageLines.join(" ")}
            className="text-xl leading-6 font-semibold tracking-normal"
          >
            {content.messageLines.map((line) => (
              <span className="block" key={line}>
                {line}
              </span>
            ))}
          </h1>
          <FallbackAction action={action} />
        </div>
      </section>
    </main>
  );
};
