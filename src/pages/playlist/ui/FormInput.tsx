import type { ComponentPropsWithRef } from "react";

interface FormInputProps extends ComponentPropsWithRef<"input"> {
  label: string;
  error?: string;
}

export const FormInput = ({ label, error, ...inputProps }: FormInputProps) => {
  return (
    <div className="relative h-[55px] w-full">
      <input
        {...inputProps}
        aria-invalid={error ? true : undefined}
        aria-label={label}
        className={`peer size-full rounded-2xl border bg-[#323232] px-[22px] text-sm font-medium text-[#fcfcfc] outline-none placeholder:text-transparent focus:border-[#00ffff] ${
          error ? "border-[#ff5b5b]" : "border-[#fcfcfc]"
        }`}
        placeholder=" "
        type="text"
      />
      <span className="pointer-events-none absolute top-[18px] left-[23px] text-sm leading-[normal] font-medium text-[#a2a2a2] opacity-0 peer-placeholder-shown:opacity-100">
        {label} <span className="text-[#00ffff]">*</span>
      </span>
    </div>
  );
};
