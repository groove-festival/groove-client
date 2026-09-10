import { SiteHeader } from "@/widgets/site-header";

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
        className="absolute top-[941px] left-0 h-[1208px] w-full bg-[linear-gradient(to_bottom,#1c1c1c_0%,#41182c_52.66%,#1c1c1c_100%)]"
      />

      <div
        aria-hidden="true"
        className="absolute top-[880px] left-[-143px] flex h-[621.175px] w-[748.169px] items-center justify-center mix-blend-overlay"
      >
        <img
          alt=""
          className="h-[591.93px] w-[724.798px] -rotate-[2.48deg]"
          src={contourTop}
        />
      </div>
      <div
        aria-hidden="true"
        className="absolute top-[1460px] left-[-269px] flex h-[806.947px] w-[813.687px] items-center justify-center mix-blend-overlay"
      >
        <img
          alt=""
          className="h-[623.155px] w-[634.844px] -scale-y-100 -rotate-[159.06deg]"
          src={contourBottom}
        />
      </div>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-0 h-[253px] w-full bg-gradient-to-b from-[#1c1c1c] to-transparent"
      />

      <div
        aria-hidden="true"
        className="absolute top-[246.025px] left-[85.59px] flex h-[202.731px] w-[217.815px] items-center justify-center"
      >
        <img
          alt=""
          className="absolute inset-0 size-full max-w-none object-cover"
          src={grooveLogo}
        />
      </div>

      <img
        alt=""
        className="pointer-events-none absolute top-0 left-[1px] h-[850px] w-[393px] max-w-none object-cover"
        src={heroIllustration}
      />

      <p className="font-slow-gothic absolute top-[104px] left-[29px] h-10 w-[332px] whitespace-nowrap text-[#fcfcfc]">
        <span className="text-xl leading-10">“우리의 </span>
        <span className="text-[28px] leading-10">밤</span>
        <span className="text-xl leading-10">은 당신의 </span>
        <span className="text-[28px] leading-10">낮</span>
        <span className="text-xl leading-10">보다 아름답다”</span>
      </p>

      <div className="font-slow-gothic absolute top-[588px] left-4 w-[270px] whitespace-nowrap text-[#fcfcfc]">
        <h1 aria-label="GROOVE FESTIVAL" className="text-[44px] leading-10 font-normal">
          <span className="block">GROOVE</span>
          <span className="block">FESTIVAL</span>
        </h1>
        <p className="text-[44px] leading-10">-</p>
        <p className="text-[44px] leading-10">10.01. - 10.02.</p>
        <p className="mt-3 text-base leading-10">
          IT x 간호 x 예술 x 사회 x 사범 x 자연
        </p>
      </div>

      <a
        aria-label="아래로 이동"
        className="absolute top-[811px] left-[180.5px] block size-8"
        href={`#${PLAYLIST_BOTTOM_ANCHOR_ID}`}
      >
        <img alt="" className="size-full" src={chevronDown} />
      </a>

      <div aria-hidden="true" className="absolute top-[1493px] left-[185px] size-6">
        <img alt="" className="absolute -inset-2 size-10 max-w-none" src={sparkle} />
      </div>
      <p className="absolute top-[1541px] left-[99px] w-[196px] text-center text-base leading-6 text-[#fcfcfc] [text-shadow:0_0_8px_rgba(252,252,252,0.8)]">
        차곡차곡 쌓아 만든 우리 시간이
        <br />
        지금의 그루브가 되었으니까.
        <br />
        <br />
        우리의 그루브는
        <br />그 어떤 낮보다 아름답습니다.
      </p>

      <SiteHeader className="left-[-4px]" />
    </>
  );
};
