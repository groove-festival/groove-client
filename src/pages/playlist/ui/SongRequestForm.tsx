import { zodResolver } from "@hookform/resolvers/zod";
import { type ComponentPropsWithRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";

import {
  type CreateSongRequestRequestBody,
  SongRequestConflictError,
  toCreateSongRequestBody,
  useCreateSongRequest,
} from "../api/createSongRequest";
import {
  colleges,
  songRequestFormDefaults,
  songRequestSchema,
  type SongRequestFormValues,
} from "../model/songRequestForm";
import { useSectionInView } from "../model/useSectionInView";
import { PLAYLIST_BOTTOM_ANCHOR_ID } from "./FestivalHero";
import {
  SongRequestCompleteModal,
  type CompletedSong,
} from "./SongRequestCompleteModal";
import { SongRequestGuideModal } from "./SongRequestGuideModal";
import { SongRequestOverwriteModal } from "./SongRequestOverwriteModal";

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

// 신청 중(접수 9/12–9/16) 하단 섹션. Figma 555:2321. 곡 검색(유튜브 뮤직) 연동과
// 실제 신청 API는 후속 이슈로 분리하며, 지금은 곡명을 자유 입력으로 받고 신청은
// api/createSongRequest의 목으로 처리한다.
export const SongRequestForm = () => {
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [completedSong, setCompletedSong] = useState<CompletedSong | null>(null);
  const [pendingOverwrite, setPendingOverwrite] =
    useState<CreateSongRequestRequestBody | null>(null);
  const sectionRef = useSectionInView<HTMLElement>({
    threshold: 0.4,
    onEnterView: () => setIsGuideOpen(true),
  });

  const {
    control,
    formState: { errors, submitCount },
    handleSubmit,
    register,
    reset,
  } = useForm<SongRequestFormValues>({
    resolver: zodResolver(songRequestSchema),
    defaultValues: songRequestFormDefaults,
  });
  const createRequest = useCreateSongRequest();

  const openCompleteModal = (song: CompletedSong) => {
    setPendingOverwrite(null);
    setCompletedSong(song);
  };

  const onValid = (values: SongRequestFormValues) => {
    createRequest.mutate(toCreateSongRequestBody(values), {
      onSuccess: (result) => {
        openCompleteModal({ title: result.song, artist: result.artist });
      },
      onError: (error) => {
        if (error instanceof SongRequestConflictError) {
          setPendingOverwrite(toCreateSongRequestBody(values));
        }
      },
    });
  };

  const confirmOverwrite = () => {
    if (!pendingOverwrite) {
      return;
    }

    createRequest.mutate(
      { ...pendingOverwrite, overwrite: true },
      {
        onSuccess: (result) => {
          openCompleteModal({ title: result.song, artist: result.artist });
        },
        onError: () => {
          // 재시도 실패 시 폼으로 돌아가 하단 오류 메시지를 노출한다.
          setPendingOverwrite(null);
        },
      },
    );
  };

  const cancelOverwrite = () => {
    setPendingOverwrite(null);
    createRequest.reset();
  };

  const closeCompleteModal = () => {
    setCompletedSong(null);
    createRequest.reset();
  };

  // 제출 후 첫 번째 검증 오류 메시지를 그대로 노출한다(예: "학번을 숫자
  // 10자리로 입력해 주세요."). 어떤 필드가 문제인지는 빨간 테두리로도 표시된다.
  const firstErrorMessage =
    submitCount > 0 ? Object.values(errors)[0]?.message : undefined;
  const showRequestError =
    createRequest.isError &&
    !pendingOverwrite &&
    !(createRequest.error instanceof SongRequestConflictError);

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
          <div className="h-[102px]">
            <label
              className="block text-sm leading-[17px] font-medium"
              htmlFor="song-search"
            >
              음악 검색(유튜브 뮤직 연동) <span className="text-[#00ffff]">*</span>
            </label>
            <div className="mt-3 flex gap-3">
              <input
                {...register("song")}
                aria-invalid={errors.song ? true : undefined}
                className={`h-[55px] min-w-0 flex-1 rounded-2xl border bg-[#323232] px-[22px] text-sm font-medium text-[#fcfcfc] outline-none placeholder:text-[#a2a2a2] focus:border-[#00ffff] ${
                  errors.song ? "border-[#ff5b5b]" : "border-[#fcfcfc]"
                }`}
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

          {firstErrorMessage && (
            <p className="text-xs leading-[15px] text-[#ff5b5b]">{firstErrorMessage}</p>
          )}
          {showRequestError && (
            <p className="text-xs leading-[15px] text-[#ff5b5b]">
              신청에 실패했어요. 잠시 후 다시 시도해 주세요.
            </p>
          )}

          <button
            className="h-14 rounded-2xl bg-[#5d00ff] text-base font-semibold disabled:opacity-60"
            disabled={createRequest.isPending}
            type="submit"
          >
            신청하기
          </button>
        </form>
      </div>

      <p className="absolute bottom-[39px] left-1/2 -translate-x-1/2 text-[10px] leading-3 whitespace-nowrap text-[#a2a2a2]">
        자세한 소식과 문의는 GROOVE 축제 공식 SNS에서 확인해 주세요.
      </p>

      <SongRequestGuideModal onClose={() => setIsGuideOpen(false)} open={isGuideOpen} />

      <SongRequestOverwriteModal
        onCancel={cancelOverwrite}
        onConfirm={confirmOverwrite}
        open={pendingOverwrite !== null && completedSong === null}
      />

      <SongRequestCompleteModal
        onChange={closeCompleteModal}
        onConfirm={() => {
          closeCompleteModal();
          reset(songRequestFormDefaults);
        }}
        open={completedSong !== null}
        song={completedSong}
      />
    </section>
  );
};
