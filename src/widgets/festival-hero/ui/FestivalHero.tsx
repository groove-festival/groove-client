import chevronDown from "../festival-visuals/chevron-down.svg";
import contourBottom from "../festival-visuals/contour-bottom.svg";
import contourTop from "../festival-visuals/contour-top.svg";
import grooveLogo from "../festival-visuals/groove-logo.png";
import heroIllustration from "../festival-visuals/hero-illustration.png";
import sparkle from "../festival-visuals/sparkle.svg";

// 세 상태(신청 전/중/후) 화면이 공유하는 상단 히어로와 중간 다크 섹션.
// Figma 555:2362 / 555:2292 / 555:2445에서 이 영역의 좌표는 동일하다.

interface FestivalHeroProps {
  id?: string;
  onBottomArrowClick: () => void;
}

export const FestivalHero = ({ id, onBottomArrowClick }: FestivalHeroProps) => {
  return (
    <section
      aria-label="GROOVE 축제 소개"
      className="relative aspect-[393/2224] w-full overflow-hidden bg-[#1c1c1c]"
      id={id}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-0 z-0 aspect-[393/850] w-full overflow-hidden bg-[#1c1c1c]"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-0 z-10 aspect-[393/850] w-full"
      >
        <div className="absolute top-[28.96%] left-[21.78%] flex h-[23.85%] w-[55.42%] items-center justify-center">
          <div className="h-[78.43%] w-[83.1%] -rotate-[16deg]">
            <img
              alt=""
              className="size-full max-w-none object-cover"
              src={grooveLogo}
            />
          </div>
        </div>
      </div>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-0 z-20 aspect-[393/850] w-full overflow-hidden"
      >
        <img
          alt=""
          className="absolute top-0 left-[0.25%] size-full max-w-none object-cover object-top"
          src={heroIllustration}
        />
      </div>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-0 z-[5] aspect-[393/850] w-full"
      >
        <div className="h-[29.76%] w-full bg-gradient-to-b from-[#1c1c1c] to-transparent" />
      </div>

      <div
        aria-hidden="true"
        className="absolute top-[42.31%] left-0 z-0 h-[54.32%] w-full bg-[linear-gradient(to_bottom,#1c1c1c_0%,#41182c_52.66%,#1c1c1c_100%)]"
      />

      <div
        aria-hidden="true"
        className="absolute top-[39.57%] left-[-36.39%] z-0 flex aspect-[748.169/621.175] w-[190.37%] items-center justify-center mix-blend-overlay"
      >
        <img
          alt=""
          className="h-[95.29%] w-[96.88%] -rotate-[2.48deg]"
          src={contourTop}
        />
      </div>
      <div
        aria-hidden="true"
        className="absolute top-[65.65%] left-[-68.45%] z-0 flex aspect-[813.687/806.947] w-[207.05%] items-center justify-center mix-blend-overlay"
      >
        <img
          alt=""
          className="h-[77.23%] w-[78.02%] -scale-y-100 -rotate-[159.06deg]"
          src={contourBottom}
        />
      </div>

      <div className="pointer-events-none absolute top-0 left-0 z-40 aspect-[393/850] w-full">
        <p
          aria-label="우리의 밤은 당신의 낮보다 아름답다"
          className="font-slow-gothic absolute top-[12.24%] left-0 h-10 w-full px-4 text-center whitespace-nowrap text-[#fcfcfc]"
        >
          <span className="text-[clamp(17px,5.09vw,26px)] leading-10">“우리의 </span>
          <span className="text-[clamp(24px,7.12vw,36px)] leading-10">밤</span>
          <span className="text-[clamp(17px,5.09vw,26px)] leading-10">은 당신의 </span>
          <span className="text-[clamp(24px,7.12vw,36px)] leading-10">낮</span>
          <span className="text-[clamp(17px,5.09vw,26px)] leading-10">
            보다 아름답다”
          </span>
        </p>

        <div className="font-slow-gothic absolute top-[69.18%] left-[4.07%] w-[68.7%] whitespace-nowrap text-[#fcfcfc]">
          <h1
            aria-label="GROOVE FESTIVAL"
            className="text-[clamp(36px,11.2vw,52px)] leading-[0.91] font-normal subpixel-antialiased [-webkit-text-stroke:1.3px_currentColor]"
          >
            <span className="block">GROOVE</span>
            <span className="block">FESTIVAL</span>
          </h1>
          <p className="text-[clamp(36px,11.2vw,52px)] leading-[0.91]">-</p>
          <p className="text-[clamp(36px,11.2vw,52px)] leading-[0.91]">
            10.01. - 10.02.
          </p>
          <p className="mt-3 text-[clamp(14px,4.07vw,20px)] leading-10">
            IT x 간호 x 예술 x 사회 x 사범 x 자연
          </p>
        </div>
      </div>

      <div className="pointer-events-none absolute top-0 left-0 z-50 aspect-[393/850] w-full">
        <button
          aria-label="아래로 이동"
          className="pointer-events-auto absolute top-[95.41%] left-1/2 block size-[clamp(28px,8.14vw,40px)] -translate-x-1/2 border-0 bg-transparent p-0"
          onClick={onBottomArrowClick}
          type="button"
        >
          <img
            alt=""
            className="animate-float size-full motion-reduce:animate-none"
            src={chevronDown}
          />
        </button>
      </div>

      <div
        aria-hidden="true"
        className="absolute top-[67.13%] left-1/2 aspect-square w-[6.11%] -translate-x-1/2"
      >
        <img
          alt=""
          className="absolute -inset-[33.33%] size-[166.67%] max-w-none"
          src={sparkle}
        />
      </div>
      <p className="absolute top-[69.29%] left-1/2 w-[49.87%] -translate-x-1/2 text-center text-[clamp(14px,4.07vw,20px)] leading-[1.5] text-[#fcfcfc] [text-shadow:0_0_8px_rgba(252,252,252,0.8)]">
        차곡차곡 쌓아 만든 시간이
        <br />
        지금의 그루브가 되었으니까.
        <br />
        <br />
        우리의 그루브는
        <br />그 어떤 낮보다 아름답습니다.
      </p>
    </section>
  );
};
