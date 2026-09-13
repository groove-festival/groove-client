import loadingSpinner from "../fallback-assets/loading-spinner.svg";

export const LoadingFallback = () => {
  return (
    <main
      className="font-pretendard flex min-h-dvh w-full items-center justify-center bg-[#1c1c1c] text-center text-[#fcfcfc]"
      role="status"
    >
      <div className="flex w-[161px] flex-col items-center gap-8">
        <img
          alt=""
          className="size-[46px] animate-spin motion-reduce:animate-none"
          src={loadingSpinner}
        />
        <p className="text-xl leading-6 font-semibold tracking-normal">
          잠시만 기다려주세요
        </p>
      </div>
    </main>
  );
};
