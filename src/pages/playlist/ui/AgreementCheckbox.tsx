import type { ComponentPropsWithRef } from "react";

interface AgreementCheckboxProps extends ComponentPropsWithRef<"input"> {
  inputId: string;
  label: string;
  linkHref: string;
  linkLabel: string;
}

export const AgreementCheckbox = ({
  inputId,
  label,
  linkHref,
  linkLabel,
  ...inputProps
}: AgreementCheckboxProps) => {
  return (
    <div className="flex flex-col gap-1">
      <label
        className="flex items-start gap-3 text-sm leading-[18px] font-semibold text-[#fcfcfc]"
        htmlFor={inputId}
      >
        <input
          {...inputProps}
          className="mt-0.5 size-5 shrink-0 rounded border border-[#cfcfcf] bg-transparent accent-[#5d00ff] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00ffff]"
          id={inputId}
          type="checkbox"
        />
        <span>
          <span className="text-[#00ffff]">(필수)</span> {label}
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
