import hourglass from "../festival-visuals/hourglass.png";

export function ContestBeforeNotice() {
  return (
    <section
      aria-labelledby="contest-before-heading"
      className="mx-auto mt-12 flex w-full flex-col items-center gap-12 pb-16 text-center"
    >
      <h2 className="text-2xl font-semibold text-[#fcfcfc]" id="contest-before-heading">
        가요제 투표는 경연 당일에 열려요
      </h2>
      <img alt="" className="h-[208px] w-[260px] object-contain" src={hourglass} />
      <p className="text-base font-medium text-[#fcfcfc]">
        현장에서 진행 중인 경기에만 투표할 수 있어요.
      </p>
    </section>
  );
}
