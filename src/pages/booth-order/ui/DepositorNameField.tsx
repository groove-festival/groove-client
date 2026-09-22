import { useId } from "react";

interface DepositorNameFieldProps {
  onChange: (value: string) => void;
  value: string;
}

const DEPOSITOR_NAME_MAX_LENGTH = 20;

// 입금자명 입력칸. 디자인의 "입금자명 *" 표시는 값이 비어 있을 때만 보이는
// 라벨로 그리고, 스크린리더에는 필수 입력으로 알린다.
export const DepositorNameField = ({ onChange, value }: DepositorNameFieldProps) => {
  const inputId = useId();

  return (
    <div className="relative h-14 w-64 shrink-0 rounded-2xl border border-[#fcfcfc] bg-[#a2a2a2]">
      <label
        className={`pointer-events-none absolute top-1/2 left-5 -translate-y-1/2 text-sm leading-[17px] font-medium text-[#fcfcfc] ${
          value ? "sr-only" : ""
        }`}
        htmlFor={inputId}
      >
        입금자명 <span className="text-[#0ff]">*</span>
      </label>
      <input
        aria-required="true"
        autoComplete="off"
        className="size-full rounded-2xl bg-transparent px-5 text-sm font-medium text-[#fcfcfc] outline-none focus-visible:ring-2 focus-visible:ring-[#cfff04]"
        data-clarity-mask="true"
        id={inputId}
        maxLength={DEPOSITOR_NAME_MAX_LENGTH}
        onChange={(event) => onChange(event.target.value)}
        type="text"
        value={value}
      />
    </div>
  );
};
