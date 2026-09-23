import { lockIllustration } from "@/shared/ui";

export function ContestClosedNotice() {
  return (
    <section className="mx-auto mt-12 flex w-full max-w-[361px] flex-col items-center gap-12 text-center">
      <h2 className="text-2xl font-semibold text-[#fcfcfc]">가요제 투표가 끝났어요</h2>
      <img
        alt=""
        className="h-[220px] w-[248px] scale-[1.16] object-cover"
        src={lockIllustration}
      />
      <p className="text-base font-medium text-[#fcfcfc]">곧 시상식이 진행됩니다!</p>
    </section>
  );
}
