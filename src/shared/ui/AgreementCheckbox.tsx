import type { ComponentPropsWithRef } from "react";

interface AgreementCheckboxProps extends ComponentPropsWithRef<"input"> {
  accent?: "violet" | "pink";
  inputId: string;
  label: string;
  linkHref: string;
  linkLabel: string;
}

export const AgreementCheckbox = ({
  accent = "violet",
  inputId,
  label,
  linkHref,
  linkLabel,
  ...inputProps
}: AgreementCheckboxProps) => {
  const isPink = accent === "pink";

  return (
    <div className="flex flex-col gap-1">
      <label
        className="flex items-start gap-3 text-sm leading-[18px] font-semibold text-[#fcfcfc]"
        htmlFor={inputId}
      >
        <input
          {...inputProps}
          className={`mt-0.5 size-5 shrink-0 rounded border border-[#cfcfcf] bg-transparent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00ffff] ${isPink ? "accent-[#ff0080]" : "accent-[#5d00ff]"}`}
          id={inputId}
          type="checkbox"
        />
        <span>
          <span className={isPink ? "text-[#ff0080]" : "text-[#00ffff]"}>(필수)</span>{" "}
          {label}
        </span>
      </label>
      <a
        className="ml-8 w-fit text-xs leading-[15px] font-medium text-[#a2a2a2] underline underline-offset-2"
        href={linkHref}
        rel="noreferrer"
        target="_blank"
      >
        {linkLabel}
      </a>
    </div>
  );
};
