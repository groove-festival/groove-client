import { type ReactNode } from "react";

interface OrderStatusScreenProps {
  children: ReactNode;
  // 진행바 채움 비율(0~1).
  progress: number;
  subtitle: string;
  title: string;
}

// 주문 제출 뒤 상태 화면 공통 틀: 진행바, 상태 문구, 영수증.
export const OrderStatusScreen = ({
  children,
  progress,
  subtitle,
  title,
}: OrderStatusScreenProps) => {
  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col items-center gap-8">
        <div
          aria-label="주문 진행 상태"
          aria-valuemax={100}
          aria-valuemin={0}
          aria-valuenow={Math.round(progress * 100)}
          className="relative h-5 w-full rounded-[11.5px] bg-gradient-to-b from-[rgba(252,252,252,0.06)] to-[rgba(252,252,252,0.13)] shadow-[inset_0_1px_0_rgba(252,252,252,0.55),inset_0_-1px_0_rgba(252,252,252,0.43)]"
          role="progressbar"
        >
          <div
            className="absolute top-[3px] left-1 h-3.5 rounded-[9px] bg-[#cfff04]"
            style={{ width: `calc((100% - 7px) * ${progress})` }}
          />
        </div>

        <div className="flex w-[309px] max-w-full flex-col items-center gap-1 text-center">
          <h1 className="w-full text-2xl leading-[29px] font-bold text-[#fcfcfc]">
            {title}
          </h1>
          <p className="w-full text-base leading-[30px] font-medium text-[#cfcfcf]">
            {subtitle}
          </p>
        </div>
      </div>

      {children}
    </div>
  );
};
