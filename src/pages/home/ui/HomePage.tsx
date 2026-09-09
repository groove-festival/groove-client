import { useState } from "react";

import chevronDown from "../festival-visuals/chevron-down.svg";
import contourBottom from "../festival-visuals/contour-bottom.svg";
import contourTop from "../festival-visuals/contour-top.svg";
import grooveLogo from "../festival-visuals/groove-logo.png";
import headerHome from "../festival-visuals/header-home.png";
import heroIllustration from "../festival-visuals/hero-illustration.png";
import menuIcon from "../festival-visuals/menu.svg";
import sparkle from "../festival-visuals/sparkle.svg";

const colleges = ["IT", "간호", "예술", "사회", "사범", "자연"] as const;

interface FormInputProps {
  label: string;
}

const FormInput = ({ label }: FormInputProps) => {
  return (
    <div className="relative h-[55px] w-full">
      <input
        aria-label={label}
        className="peer size-full rounded-2xl border border-[#fcfcfc] bg-[#323232] px-[22px] text-sm font-medium text-[#fcfcfc] outline-none placeholder:text-transparent focus:border-[#00ffff]"
        placeholder=" "
        type="text"
      />
      <span className="pointer-events-none absolute top-[18px] left-[23px] text-sm leading-[normal] font-medium text-[#a2a2a2] opacity-0 peer-placeholder-shown:opacity-100">
        {label} <span className="text-[#00ffff]">*</span>
      </span>
    </div>
  );
};

export default function HomePage() {
  const [selectedCollege, setSelectedCollege] =
    useState<(typeof colleges)[number]>("IT");

  return (
    <>
      <header
        className="fixed top-0 left-1/2 z-50 h-16 w-full max-w-[600px] -translate-x-1/2 bg-[rgba(28,28,28,0.4)] backdrop-blur-[12px]"
        data-node-id="555:2351"
      >
        <div className="relative mx-auto flex h-full max-w-[600px] items-center justify-center px-5">
          <button
            aria-label="메뉴 열기"
            className="absolute top-1/2 left-5 size-7 shrink-0 -translate-y-1/2"
            type="button"
          >
            <img alt="" className="size-full" src={menuIcon} />
          </button>
          <a
            aria-label="GROOVE 홈"
            className="relative block h-14 w-[58px] shrink-0 overflow-hidden"
            href="#top"
          >
            <img
              alt=""
              className="absolute top-[-23.04%] left-[-24.74%] h-[145.24%] w-[148.51%] max-w-none"
              src={headerHome}
            />
          </a>
        </div>
      </header>

      <div className="h-16 shrink-0" />

      <main className="flex flex-1 flex-col overflow-x-hidden bg-[#1c1c1c] text-[#fcfcfc]">
        <div
          className="figma-mobile-canvas relative h-[3195px] bg-[#1c1c1c]"
          data-node-id="555:2292"
          id="top"
        >
          <div
            aria-hidden="true"
            className="absolute top-[941px] left-0 h-[1208px] w-full bg-[linear-gradient(to_bottom,#1c1c1c_0%,#41182c_52.66%,#1c1c1c_100%)]"
            data-node-id="555:2295"
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
            data-node-id="555:2309"
          />

          <div
            aria-hidden="true"
            className="absolute top-[246.025px] left-[85.59px] flex h-[202.731px] w-[217.815px] items-center justify-center"
            data-node-id="555:2311"
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
            data-node-id="555:2312"
            src={heroIllustration}
          />

          <p
            className="font-slow-gothic absolute top-[104px] left-[29px] h-10 w-[332px] whitespace-nowrap text-[#fcfcfc]"
            data-node-id="555:2318"
          >
            <span className="text-xl leading-10">“우리의 </span>
            <span className="text-[28px] leading-10">밤</span>
            <span className="text-xl leading-10">은 당신의 </span>
            <span className="text-[28px] leading-10">낮</span>
            <span className="text-xl leading-10">보다 아름답다”</span>
          </p>

          <div
            className="font-slow-gothic absolute top-[588px] left-4 w-[270px] whitespace-nowrap text-[#fcfcfc]"
            data-node-id="555:2313"
          >
            <h1
              aria-label="GROOVE FESTIVAL"
              className="text-[44px] leading-10 font-normal"
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

          <a
            aria-label="노래 신청하러 가기"
            className="absolute top-[811px] left-[180.5px] block size-8"
            href="#song-request"
          >
            <img alt="" className="size-full" src={chevronDown} />
          </a>

          <div
            aria-hidden="true"
            className="absolute top-[1493px] left-[185px] size-6"
            data-node-id="582:1859"
          >
            <img
              alt=""
              className="absolute -inset-2 size-10 max-w-none"
              src={sparkle}
            />
          </div>
          <p
            className="absolute top-[1541px] left-[99px] w-[196px] text-center text-base leading-6 text-[#fcfcfc] [text-shadow:0_0_8px_rgba(252,252,252,0.8)]"
            data-node-id="582:1858"
          >
            차곡차곡 쌓아 만든 우리 시간이
            <br />
            지금의 그루브가 되었으니까.
            <br />
            <br />
            우리의 그루브는
            <br />그 어떤 낮보다 아름답습니다.
          </p>

          <section
            className="absolute top-[2236px] left-0 h-[959px] w-full bg-[#1c1c1c]"
            data-node-id="555:2321"
            id="song-request"
          >
            <div
              className="font-pretendard absolute top-[63px] right-4 left-4"
              data-node-id="555:2322"
            >
              <div className="flex flex-col gap-1">
                <h2 className="text-2xl leading-[29px] font-bold">노래 신청하기</h2>
                <p className="text-xs leading-[15px] text-[#a2a2a2]">
                  *학번당 최종 1곡만 신청 가능
                </p>
              </div>

              <form
                className="mt-6 flex flex-col gap-5"
                onSubmit={(event) => event.preventDefault()}
              >
                <div className="h-[102px]">
                  <label
                    className="block text-sm leading-[17px] font-medium"
                    htmlFor="song-search"
                  >
                    음악 검색(유튜브 뮤직 연동){" "}
                    <span className="text-[#00ffff]">*</span>
                  </label>
                  <div className="mt-3 flex gap-3">
                    <input
                      className="h-[55px] min-w-0 flex-1 rounded-2xl border border-[#fcfcfc] bg-[#323232] px-[22px] text-sm font-medium text-[#fcfcfc] outline-none placeholder:text-[#a2a2a2] focus:border-[#00ffff]"
                      id="song-search"
                      placeholder="곡 제목 또는 아티스트 검색"
                      type="search"
                    />
                    <button
                      className="h-[57px] w-[111px] shrink-0 rounded-2xl bg-[#5d00ff] text-sm font-semibold"
                      type="button"
                    >
                      검색
                    </button>
                  </div>
                  <p className="mt-1 text-[10px] leading-3 text-[#a2a2a2]">
                    *유튜브 뮤직에 있는 음악만 검색 및 선택할 수 있습니다.
                  </p>
                </div>

                <FormInput label="학번" />

                <fieldset className="h-[155px]">
                  <legend className="text-sm leading-[17px] font-medium">
                    단대 선택 <span className="text-[#00ffff]">*</span>
                  </legend>
                  <div className="mt-3 grid grid-cols-3 gap-3">
                    {colleges.map((college) => {
                      const isSelected = college === selectedCollege;

                      return (
                        <button
                          aria-pressed={isSelected}
                          className={`h-14 rounded-2xl border text-sm font-semibold ${
                            isSelected
                              ? "border-[#5d00ff] bg-[#5d00ff]"
                              : "border-[#fcfcfc] bg-transparent"
                          }`}
                          key={college}
                          onClick={() => setSelectedCollege(college)}
                          type="button"
                        >
                          {college}
                        </button>
                      );
                    })}
                  </div>
                </fieldset>

                <FormInput label="학과" />
                <FormInput label="이름" />
                <FormInput label="닉네임" />

                <button
                  className="h-14 rounded-2xl bg-[#5d00ff] text-base font-semibold"
                  type="submit"
                >
                  신청하기
                </button>
              </form>
            </div>

            <p className="absolute bottom-[39px] left-1/2 -translate-x-1/2 text-[10px] leading-3 whitespace-nowrap text-[#a2a2a2]">
              자세한 소식과 문의는 GROOVE 축제 공식 SNS에서 확인해 주세요.
            </p>
          </section>
        </div>
      </main>
    </>
  );
}
