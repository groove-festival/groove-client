interface DotSpinnerProps {
  className?: string;
  label?: string;
}

const DOT_DELAYS_MS = [0, 160, 320];

export const DotSpinner = ({ className = "", label }: DotSpinnerProps) => {
  return (
    <div
      aria-hidden={label ? undefined : true}
      aria-label={label}
      className={`flex h-5 w-[61px] items-center gap-2 ${className}`}
      role={label ? "status" : undefined}
    >
      {DOT_DELAYS_MS.map((delay) => (
        <span
          className="animate-groove-dot-pulse size-2.5 rounded-full bg-[linear-gradient(180deg,#5D00FF_0%,#00FFFF_100%)] shadow-[0_0_8px_rgba(0,255,255,0.45)] motion-reduce:animate-none"
          key={delay}
          style={{ animationDelay: `${delay}ms` }}
        />
      ))}
    </div>
  );
};
