import { zodResolver } from "@hookform/resolvers/zod";
import { type ComponentPropsWithRef, useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";

import { ApiError } from "@/shared/api";

import { type SongTrack, useSearchSongs } from "../api/searchSongs";
import { toSubmitSongBody, useSubmitSong } from "../api/submitSong";
import {
  colleges,
  songRequestFormDefaults,
  songRequestSchema,
  type SongRequestFormValues,
} from "../model/songRequestForm";
import { useSectionInView } from "../model/useSectionInView";
import { PLAYLIST_BOTTOM_ANCHOR_ID } from "./FestivalHero";
import {
  type CompletedSong,
  SongRequestCompleteModal,
} from "./SongRequestCompleteModal";
import { SongRequestGuideModal } from "./SongRequestGuideModal";

interface SongRequestFormProps {
  guideOpen?: boolean;
  onGuideClose?: () => void;
  onGuideSectionEnter?: () => void;
}

interface FormInputProps extends ComponentPropsWithRef<"input"> {
  label: string;
  error?: string;
}

const FormInput = ({ label, error, ...inputProps }: FormInputProps) => {
  return (
    <div className="relative h-[55px] w-full">
      <input
        {...inputProps}
        aria-invalid={error ? true : undefined}
        aria-label={label}
        className={`peer size-full rounded-2xl border bg-[#323232] px-[22px] text-sm font-medium text-[#fcfcfc] outline-none placeholder:text-transparent focus:border-[#00ffff] ${
          error ? "border-[#ff5b5b]" : "border-[#fcfcfc]"
        }`}
        placeholder=" "
        type="text"
      />
      <span className="pointer-events-none absolute top-[18px] left-[23px] text-sm leading-[normal] font-medium text-[#a2a2a2] opacity-0 peer-placeholder-shown:opacity-100">
        {label} <span className="text-[#00ffff]">*</span>
      </span>
    </div>
  );
};

// 곡 검색 실패 코드를 사용자 문구로 옮긴다.
const searchErrorMessage = (error: unknown): string => {
  if (error instanceof ApiError) {
    if (error.code === "PLST005") {
      return "곡 검색 서비스에 문제가 생겼어요. 잠시 후 다시 시도해 주세요.";
    }
    if (error.code === "PLST001") {
      return "지금은 접수 기간이 아니에요.";
    }
    if (error.code === "C001") {
      return "검색어를 확인해 주세요.";
    }
  }
  return "검색에 실패했어요. 잠시 후 다시 시도해 주세요.";
};

// 신청 실패 코드를 사용자 문구로 옮긴다.
const submitErrorMessage = (error: unknown): string => {
  if (error instanceof ApiError) {
    if (error.code === "PLST009") {
      return "신청이 몰려 잠시 제한됐어요. 잠시 후 다시 시도해 주세요.";
    }
    if (error.code === "PLST007") {
      return "곡 정보가 만료됐어요. 곡을 다시 검색해서 선택해 주세요.";
    }
    if (error.code === "PLST010") {
      return "이미 다른 사람이 신청한 곡입니다. 다른 곡을 선택해주세요.";
    }
    if (error.code === "PLST001") {
      return "지금은 접수 기간이 아니에요.";
    }
  }
  return "신청에 실패했어요. 잠시 후 다시 시도해 주세요.";
};

// 신청 중(SUBMISSION) 하단 섹션. Figma 555:2321.
// 곡은 PLST-2 검색 결과에서 고른 trackId로만 신청한다(PLST-3). 학번당 최종 1곡이고
// 같은 학번의 재신청은 서버가 새 곡으로 덮어쓴다.
export const SongRequestForm = ({
  guideOpen,
  onGuideClose,
  onGuideSectionEnter,
}: SongRequestFormProps) => {
  const [isInternalGuideOpen, setIsInternalGuideOpen] = useState(false);
  const [completedSong, setCompletedSong] = useState<CompletedSong | null>(null);
  const [keyword, setKeyword] = useState("");
  const [selectedTrack, setSelectedTrack] = useState<SongTrack | null>(null);
  const [isResultsClosed, setIsResultsClosed] = useState(false);
  const resultsRef = useRef<HTMLUListElement>(null);
  const isGuideOpen = guideOpen ?? isInternalGuideOpen;
  const closeGuide = onGuideClose ?? (() => setIsInternalGuideOpen(false));
  const sectionRef = useSectionInView<HTMLElement>({
    threshold: 0.4,
    onEnterView: () => {
      if (onGuideSectionEnter) {
        onGuideSectionEnter();
        return;
      }

      setIsInternalGuideOpen(true);
    },
  });

  const {
    control,
    formState: { errors, submitCount },
    handleSubmit,
    register,
    reset,
    setValue,
  } = useForm<SongRequestFormValues>({
    resolver: zodResolver(songRequestSchema),
    defaultValues: songRequestFormDefaults,
  });
  const search = useSearchSongs();
  const submit = useSubmitSong();

  const runSearch = () => {
    const trimmed = keyword.trim();
    if (!trimmed) {
      return;
    }
    submit.reset();
    setIsResultsClosed(false);
    search.mutate(trimmed);
  };

  const pickTrack = (track: SongTrack) => {
    setSelectedTrack(track);
    setValue("trackId", track.trackId, { shouldValidate: submitCount > 0 });
  };

  const clearTrack = () => {
    setSelectedTrack(null);
    setValue("trackId", "", { shouldValidate: submitCount > 0 });
  };

  const onValid = (values: SongRequestFormValues) => {
    submit.mutate(
      { body: toSubmitSongBody(values), idempotencyKey: crypto.randomUUID() },
      {
        onSuccess: (result) => {
          setCompletedSong({
            title: result.title,
            artist: result.artist,
            albumCoverUrl: result.albumCoverUrl,
          });
        },
      },
    );
  };

  const closeCompleteModal = () => {
    setCompletedSong(null);
    submit.reset();
  };

  const resetForm = () => {
    closeCompleteModal();
    reset(songRequestFormDefaults);
    setKeyword("");
    setSelectedTrack(null);
    search.reset();
  };

  // 제출 후 첫 번째 검증 오류 메시지를 그대로 노출한다.
  const firstErrorMessage =
    submitCount > 0 ? Object.values(errors)[0]?.message : undefined;
  const searchResults = search.data ?? [];
  const showResults = !selectedTrack && !isResultsClosed && searchResults.length > 0;

  // 결과 박스 바깥을 클릭하면 닫는다.
  useEffect(() => {
    if (!showResults) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!resultsRef.current?.contains(event.target as Node)) {
        setIsResultsClosed(true);
      }
    };
    document.addEventListener("mousedown", handlePointerDown);

    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [showResults]);

  return (
    <section
      className="absolute top-[2236px] left-0 h-[959px] w-full bg-[#1c1c1c]"
      id={PLAYLIST_BOTTOM_ANCHOR_ID}
      ref={sectionRef}
    >
      <div className="font-pretendard absolute top-[63px] right-4 left-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl leading-[29px] font-bold">노래 신청하기</h2>
          <p className="text-xs leading-[15px] text-[#a2a2a2]">
            *학번당 최종 1곡만 신청 가능
          </p>
        </div>

        <form className="mt-6 flex flex-col gap-5" onSubmit={handleSubmit(onValid)}>
          <input type="hidden" {...register("trackId")} />

          <div>
            <label
              className="block text-sm leading-[17px] font-medium"
              htmlFor="song-search"
            >
              음악 검색 <span className="text-[#00ffff]">*</span>
            </label>
            <div className="relative mt-3 flex gap-3">
              <input
                className="h-[55px] min-w-0 flex-1 rounded-2xl border border-[#fcfcfc] bg-[#323232] px-[22px] text-sm font-medium text-[#fcfcfc] outline-none placeholder:text-[#a2a2a2] focus:border-[#00ffff]"
                id="song-search"
                onChange={(event) => setKeyword(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    runSearch();
                  }
                }}
                placeholder="곡 제목 또는 아티스트 검색"
                type="search"
                value={keyword}
              />
              <button
                className="h-[57px] w-[111px] shrink-0 rounded-2xl bg-[#5d00ff] text-sm font-semibold disabled:opacity-60"
                disabled={search.isPending || keyword.trim().length === 0}
                onClick={runSearch}
                type="button"
              >
                {search.isPending ? "검색 중" : "검색"}
              </button>

              {/* 결과가 폼 높이를 밀어내지 않도록 입력창 바로 아래 오버레이로
                  띄운다. 선택하면 사라지고 아래 선택된 곡 카드로 바뀐다. 박스
                  바깥을 클릭하면 닫힌다. */}
              {showResults && (
                <ul
                  className="themed-scrollbar absolute top-full right-0 left-0 z-20 mt-2 flex max-h-[200px] flex-col gap-2 overflow-y-auto rounded-2xl border border-[#5d5d5d] bg-[#1c1c1c] p-2 shadow-xl"
                  ref={resultsRef}
                >
                  {searchResults.map((track) => (
                    <li key={track.trackId}>
                      <button
                        className="flex w-full items-center gap-3 rounded-2xl border border-[#5d5d5d] bg-[#323232] p-3 text-left"
                        onClick={() => pickTrack(track)}
                        type="button"
                      >
                        {track.albumCoverUrl ? (
                          <img
                            alt=""
                            className="size-12 shrink-0 rounded-lg object-cover"
                            src={track.albumCoverUrl}
                          />
                        ) : (
                          <div className="size-12 shrink-0 rounded-lg bg-[#5d5d5d]" />
                        )}
                        <div className="flex min-w-0 flex-1 flex-col">
                          <p className="truncate text-sm font-semibold text-[#fcfcfc]">
                            {track.title}
                          </p>
                          <p className="truncate text-xs text-[#a2a2a2]">
                            {track.artist}
                          </p>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <p className="mt-1 text-[10px] leading-3 text-[#a2a2a2]">
              *실제 음원이 있는 곡만 검색·선택할 수 있습니다.
            </p>

            {selectedTrack ? (
              <div className="mt-3 flex items-center gap-3 rounded-2xl border border-[#00ffff] bg-[#323232] p-3">
                {selectedTrack.albumCoverUrl ? (
                  <img
                    alt=""
                    className="size-12 shrink-0 rounded-lg object-cover"
                    src={selectedTrack.albumCoverUrl}
                  />
                ) : (
                  <div className="size-12 shrink-0 rounded-lg bg-[#5d5d5d]" />
                )}
                <div className="flex min-w-0 flex-1 flex-col">
                  <p className="truncate text-sm font-semibold text-[#fcfcfc]">
                    {selectedTrack.title}
                  </p>
                  <p className="truncate text-xs text-[#a2a2a2]">
                    {selectedTrack.artist}
                  </p>
                </div>
                <button
                  className="shrink-0 text-xs font-semibold text-[#00ffff] underline"
                  onClick={clearTrack}
                  type="button"
                >
                  변경
                </button>
              </div>
            ) : (
              <>
                {search.isError && (
                  <p className="mt-2 text-xs leading-[15px] text-[#ff5b5b]">
                    {searchErrorMessage(search.error)}
                  </p>
                )}
                {search.isSuccess && searchResults.length === 0 && (
                  <p className="mt-2 text-xs leading-[15px] text-[#a2a2a2]">
                    검색 결과가 없어요. 다른 검색어로 시도해 주세요.
                  </p>
                )}
              </>
            )}
          </div>

          <fieldset>
            <legend className="text-sm leading-[17px] font-medium">
              단대 선택 <span className="text-[#00ffff]">*</span>
            </legend>
            <Controller
              control={control}
              name="college"
              render={({ field }) => (
                <div className="mt-3 grid grid-cols-3 gap-3">
                  {colleges.map((college) => {
                    const isSelected = college === field.value;

                    return (
                      <button
                        aria-pressed={isSelected}
                        className={`h-14 rounded-2xl border text-sm font-semibold ${
                          isSelected
                            ? "border-[#5d00ff] bg-[#5d00ff]"
                            : "border-[#fcfcfc] bg-transparent"
                        }`}
                        key={college}
                        onClick={() => field.onChange(college)}
                        type="button"
                      >
                        {college}
                      </button>
                    );
                  })}
                </div>
              )}
            />
          </fieldset>

          <FormInput
            error={errors.studentId?.message}
            inputMode="numeric"
            label="학번"
            maxLength={10}
            {...register("studentId")}
          />

          <FormInput
            error={errors.department?.message}
            label="학과"
            {...register("department")}
          />
          <FormInput error={errors.name?.message} label="이름" {...register("name")} />
          <FormInput
            error={errors.nickname?.message}
            label="닉네임"
            {...register("nickname")}
          />
          <p className="-mt-4 text-[10px] leading-3 text-[#a2a2a2]">
            * 닉네임은 플레이리스트에서 신청자명 대신 보여질 이름입니다.
          </p>

          {firstErrorMessage && (
            <p className="text-xs leading-[15px] text-[#ff5b5b]">{firstErrorMessage}</p>
          )}
          {submit.isError && (
            <p className="text-xs leading-[15px] text-[#ff5b5b]">
              {submitErrorMessage(submit.error)}
            </p>
          )}

          <button
            className="h-14 rounded-2xl bg-[#5d00ff] text-base font-semibold disabled:opacity-60"
            disabled={submit.isPending}
            type="submit"
          >
            신청하기
          </button>
        </form>
      </div>

      <p className="absolute bottom-[39px] left-1/2 -translate-x-1/2 text-[10px] leading-3 whitespace-nowrap text-[#a2a2a2]">
        자세한 소식과 문의는 GROOVE 축제 공식 SNS에서 확인해 주세요.
      </p>

      <SongRequestGuideModal onClose={closeGuide} open={isGuideOpen} />

      <SongRequestCompleteModal
        onChange={closeCompleteModal}
        onConfirm={resetForm}
        open={completedSong !== null}
        song={completedSong}
      />
    </section>
  );
};
