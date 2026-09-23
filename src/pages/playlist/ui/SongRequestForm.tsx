import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";

import { useSectionInView } from "@/shared/lib/viewport";
import { AgreementCheckbox, InteractionLoadingOverlay } from "@/shared/ui";

import { songRequestAgreementLinks } from "../model/legalLinks";
import { PLAYLIST_BOTTOM_ANCHOR_ID } from "../model/playlistAnchors";
import { submitErrorMessage } from "../model/songRequestErrorMessages";
import {
  colleges,
  songRequestFormDefaults,
  songRequestSchema,
  type SongRequestFormValues,
} from "../model/songRequestForm";
import { useSongRequestSubmission } from "../model/useSongRequestSubmission";
import { useSongTrackPicker } from "../model/useSongTrackPicker";
import { FormInput } from "./FormInput";
import { SongRequestCompleteModal } from "./SongRequestCompleteModal";
import { SongRequestGuideModal } from "./SongRequestGuideModal";
import { SongTrackPicker } from "./SongTrackPicker";

interface SongRequestFormProps {
  guideOpen?: boolean;
  onGuideClose?: () => void;
  onGuideSectionEnter?: () => void;
}

// 신청 중(SUBMISSION) 하단 섹션. Figma 555:2321.
// 곡은 PLST-2 검색 결과에서 고른 trackId로만 신청한다(PLST-3). 학번당 최종 1곡이고
// 같은 학번의 재신청은 서버가 새 곡으로 덮어쓴다.
export const SongRequestForm = ({
  guideOpen,
  onGuideClose,
  onGuideSectionEnter,
}: SongRequestFormProps) => {
  const [isInternalGuideOpen, setIsInternalGuideOpen] = useState(false);
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
  const {
    completedSong,
    isSubmitting,
    isSubmitError,
    submitError,
    resetSubmit,
    handleFormSubmit,
    markFormStarted,
    closeCompleteModal,
  } = useSongRequestSubmission(handleSubmit);
  const picker = useSongTrackPicker({
    onSearchStart: resetSubmit,
    onTrackChange: (trackId) =>
      setValue("trackId", trackId, { shouldValidate: submitCount > 0 }),
  });
  const resetForm = () => {
    closeCompleteModal();
    reset(songRequestFormDefaults);
    picker.resetPicker();
  };

  // 제출 후 첫 번째 검증 오류 메시지를 그대로 노출한다.
  const firstErrorMessage =
    submitCount > 0 ? Object.values(errors)[0]?.message : undefined;
  const termsAgreed = useWatch({ control, name: "termsAgreed" });
  const personalInfoCollectionAgreed = useWatch({
    control,
    name: "personalInfoCollectionAgreed",
  });
  const interactionLoadingLabel = picker.isSearching
    ? "곡을 검색하는 중입니다"
    : isSubmitting
      ? "신청을 처리하는 중입니다"
      : undefined;
  const isSubmitDisabled =
    isSubmitting || !termsAgreed || !personalInfoCollectionAgreed;

  return (
    <section
      className="absolute top-[2236px] left-0 h-[1160px] w-full bg-[#1c1c1c]"
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

        <form
          className="mt-6 flex flex-col gap-5"
          onChange={markFormStarted}
          onSubmit={handleFormSubmit}
        >
          <input type="hidden" {...register("trackId")} />

          <SongTrackPicker picker={picker} />

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

          <div className="flex flex-col gap-3 rounded-2xl border border-[#3a3a3a] bg-[#232323] p-4">
            <AgreementCheckbox
              inputId="terms-agreed"
              label="GROOVE 웹서비스 이용약관에 동의합니다."
              linkHref={songRequestAgreementLinks.serviceTermsUrl}
              linkLabel="약관 전문 보기"
              {...register("termsAgreed")}
            />
            <AgreementCheckbox
              inputId="personal-info-collection-agreed"
              label="개인정보 수집 및 이용에 동의합니다."
              linkHref={songRequestAgreementLinks.personalInfoCollectionUrl}
              linkLabel="동의서 전문 보기"
              {...register("personalInfoCollectionAgreed")}
            />
          </div>

          {firstErrorMessage && (
            <p className="text-xs leading-[15px] text-[#ff5b5b]">{firstErrorMessage}</p>
          )}
          {isSubmitError && (
            <p className="text-xs leading-[15px] text-[#ff5b5b]">
              {submitErrorMessage(submitError)}
            </p>
          )}

          <button
            className={`h-14 rounded-2xl text-base font-semibold transition-colors disabled:cursor-not-allowed ${
              isSubmitDisabled
                ? "bg-[#cfcfcf] text-[#fcfcfc]"
                : "bg-[#5d00ff] text-[#fcfcfc]"
            }`}
            disabled={isSubmitDisabled}
            type="submit"
          >
            신청하기
          </button>
        </form>
      </div>

      <SongRequestGuideModal onClose={closeGuide} open={isGuideOpen} />

      <SongRequestCompleteModal
        onChange={closeCompleteModal}
        onConfirm={resetForm}
        open={completedSong !== null}
        song={completedSong}
      />

      {interactionLoadingLabel && (
        <InteractionLoadingOverlay label={interactionLoadingLabel} />
      )}
    </section>
  );
};
