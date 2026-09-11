import chevronDown from "../festival-visuals/chevron-down.svg";
import contourBottom from "../festival-visuals/contour-bottom.svg";
import contourTop from "../festival-visuals/contour-top.svg";
import grooveLogo from "../festival-visuals/groove-logo.png";
import heroIllustration from "../festival-visuals/hero-illustration.png";
import sparkle from "../festival-visuals/sparkle.svg";

// 세 상태(신청 전/중/후) 화면이 공유하는 상단 히어로와 중간 다크 섹션.
// Figma 555:2362 / 555:2292 / 555:2445에서 이 영역의 좌표는 동일하다.
export const PLAYLIST_BOTTOM_ANCHOR_ID = "playlist-bottom";

export const FestivalHero = () => {
  return (
    <>
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
        className="absolute top-[941px] left-0 z-0 h-[1208px] w-full bg-[linear-gradient(to_bottom,#1c1c1c_0%,#41182c_52.66%,#1c1c1c_100%)]"
      />

      <div
        aria-hidden="true"
        className="absolute top-[880px] left-[-143px] z-0 flex h-[621.175px] w-[748.169px] items-center justify-center mix-blend-overlay"
      >
        <img
          alt=""
          className="h-[591.93px] w-[724.798px] -rotate-[2.48deg]"
          src={contourTop}
        />
      </div>
      <div
        aria-hidden="true"
        className="absolute top-[1460px] left-[-269px] z-0 flex h-[806.947px] w-[813.687px] items-center justify-center mix-blend-overlay"
      >
        <img
          alt=""
          className="h-[623.155px] w-[634.844px] -scale-y-100 -rotate-[159.06deg]"
          src={contourBottom}
        />
      </div>

      <div className="pointer-events-none absolute top-0 left-0 z-40 aspect-[393/850] w-full">
        <p className="font-slow-gothic absolute top-[12.24%] left-1/2 h-10 w-[335px] -translate-x-1/2 whitespace-nowrap text-[#fcfcfc]">
          <span className="text-xl leading-10">“우리의 </span>
          <span className="text-[28px] leading-10">밤</span>
          <span className="text-xl leading-10">은 당신의 </span>
          <span className="text-[28px] leading-10">낮</span>
          <span className="text-xl leading-10">보다 아름답다”</span>
        </p>

        <div className="font-slow-gothic absolute top-[69.18%] left-[4.07%] w-[270px] whitespace-nowrap text-[#fcfcfc]">
          <h1
            aria-label="GROOVE FESTIVAL"
            className="text-[44px] leading-10 font-normal subpixel-antialiased [-webkit-text-stroke:1.3px_currentColor]"
          >
            <span className="block">GROOVE</span>
            <span className="block">FESTIVAL</span>
          </h1>
          <p className="text-[44px] leading-10">-</p>
          <p className="text-[44px] leading-10">10.01. - 10.02.</p>
          <p className="mt-3 text-base leading-10">
            IT x 간호 x 예술 x 사회 x 사범 x 자연
          </p>
        </div>
      </div>

      <div className="pointer-events-none absolute top-0 left-0 z-50 aspect-[393/850] w-full">
        <a
          aria-label="아래로 이동"
          className="pointer-events-auto absolute top-[95.41%] left-1/2 block size-8 -translate-x-1/2"
          href={`#${PLAYLIST_BOTTOM_ANCHOR_ID}`}
        >
          <img
            alt=""
            className="animate-float size-full motion-reduce:animate-none"
            src={chevronDown}
          />
        </a>
      </div>

      <div
        aria-hidden="true"
        className="absolute top-[1493px] left-1/2 size-6 -translate-x-1/2"
      >
        <img alt="" className="absolute -inset-2 size-10 max-w-none" src={sparkle} />
      </div>
      <p className="absolute top-[1541px] left-1/2 w-[196px] -translate-x-1/2 text-center text-base leading-6 text-[#fcfcfc] [text-shadow:0_0_8px_rgba(252,252,252,0.8)]">
        차곡차곡 쌓아 만든 우리 시간이
        <br />
        지금의 그루브가 되었으니까.
        <br />
        <br />
        우리의 그루브는
        <br />그 어떤 낮보다 아름답습니다.
      </p>
    </>
  );
};
