import { hourglassIllustration } from "@/shared/ui";

export function ContestBeforeNotice() {
  return (
    <section
      aria-labelledby="contest-before-heading"
      className="mx-auto mt-20 flex w-full flex-col items-center gap-8 text-center"
    >
      <h2
        className="mb-4 w-full text-2xl font-semibold text-[#fcfcfc] min-[480px]:text-3xl"
        id="contest-before-heading"
      >
        가요제 투표는 경연 당일에 열려요
      </h2>
      <img
        alt=""
        className="aspect-[5/4] h-auto w-50 object-contain"
        src={hourglassIllustration}
      />
      <p className="w-full text-base font-medium text-[#fcfcfc] min-[480px]:text-lg">
        현장에서 진행 중인 경연에만 투표할 수 있어요.
      </p>
    </section>
  );
}
