import { useState } from "react";

import { PLAYLIST_BOTTOM_ANCHOR_ID } from "./FestivalHero";

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

// 신청 중(접수 9/12–9/16) 하단 섹션. Figma 555:2321. UI 정적 구현이며 실제
// 유튜브뮤직 검색·신청 API 연동은 후속 이슈로 분리한다.
export const SongRequestForm = () => {
  const [selectedCollege, setSelectedCollege] =
    useState<(typeof colleges)[number]>("IT");

  return (
    <section
      className="absolute top-[2236px] left-0 h-[959px] w-full bg-[#1c1c1c]"
      id={PLAYLIST_BOTTOM_ANCHOR_ID}
    >
      <div className="font-pretendard absolute top-[63px] right-4 left-4">
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
              음악 검색(유튜브 뮤직 연동) <span className="text-[#00ffff]">*</span>
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

          <FormInput label="학번" />

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
  );
};
