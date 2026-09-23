import hourglass from "../festival-visuals/hourglass.png";

export function ContestBeforeNotice() {
  return (
    <section className="mx-auto mt-12 flex w-full max-w-[361px] flex-col items-center gap-12 text-center">
      <h2 className="text-2xl font-semibold text-[#fcfcfc]">
        가요제 투표가 아직이에요
      </h2>
      <img alt="" className="h-[208px] w-[260px] object-contain" src={hourglass} />
      <p className="text-base font-medium text-[#fcfcfc]">곧 경연이 시작 됩니다!</p>
    </section>
  );
}
