import { lockIllustration } from "@/shared/ui";

export function ContestClosedNotice() {
  return (
    <section className="mx-auto mt-12 flex w-full flex-col items-center gap-12 text-center">
      <h2 className="w-full text-2xl font-semibold text-[#fcfcfc] min-[480px]:text-3xl">
        가요제 투표가 끝났어요
      </h2>
      <img
        alt=""
        className="aspect-[62/55] h-auto w-[69%] max-w-[344px] scale-[1.16] object-cover"
        src={lockIllustration}
      />
      <p className="w-full text-base font-medium text-[#fcfcfc] min-[480px]:text-lg">
        곧 시상식이 진행됩니다!
      </p>
    </section>
  );
}
