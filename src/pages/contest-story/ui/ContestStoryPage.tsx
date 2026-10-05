import { useSearchParams } from "react-router";

import { useFestivalStatus } from "@/entities/festival";
import { useScheduledRefetch } from "@/shared/lib/scheduling";
import {
  hourglassIllustration,
  letterIllustration,
  LoadingFallback,
  NetworkErrorFallback,
  lockIllustration,
  storyIconSprite,
} from "@/shared/ui";

import { nextStoryBoundaryAt, parseStoryPhaseOverride } from "../model/storyPhase";
import { useStorySubmission } from "../model/useStorySubmission";
import { StoryForm } from "./StoryForm";
import { StoryGuideModal } from "./StoryGuideModal";

export default function ContestStoryPage() {
  const [searchParams] = useSearchParams();
  const status = useFestivalStatus();
  const override = parseStoryPhaseOverride(searchParams.get("phase"));
  const storyPhase = override ?? status.data?.stage?.storyPhase;
  const {
    effectiveView,
    canWriteStory,
    guideOpen,
    authError,
    authPending,
    wrongRole,
    isLoginPending,
    loginErrorMessage,
    isSubmitting,
    submitErrorMessage,
    handleGoogleCredential,
    handleCloseGuide,
    handleContinueToForm,
    handleOpenGuide,
    handleRetryAuth,
    handleSubmit,
    showIntro,
  } = useStorySubmission(storyPhase);
  useScheduledRefetch(
    override ? undefined : nextStoryBoundaryAt(storyPhase, status.data?.stage),
    status.refetch,
  );
  if (!storyPhase && status.isPending) return <LoadingFallback />;
  if (!storyPhase && status.isError)
    return <NetworkErrorFallback onReload={() => void status.refetch()} />;

  return (
    <main
      className={`relative w-full bg-[#1c1c1c] px-4 pt-20 text-[#fcfcfc] ${
        storyPhase === "OPEN" && effectiveView === "intro"
          ? "pb-10"
          : "min-h-[calc(100dvh-64px)] pb-24"
      }`}
    >
      {storyPhase === "BEFORE" && (
        <section className="mx-auto flex w-full flex-col items-center gap-12 pt-[160px] text-center">
          <h1 className="w-full text-2xl font-semibold min-[480px]:text-3xl">
            사연 모집을 준비하고 있어요
          </h1>
          <img
            alt=""
            className="aspect-[5/4] h-auto w-[73%] max-w-[360px] object-contain"
            src={hourglassIllustration}
          />
          <p className="w-full text-base font-medium min-[480px]:text-lg">
            모집이 열리면 무대에서 소개될 이야기를 남길 수 있어요.
          </p>
        </section>
      )}

      {storyPhase === "CLOSED" && (
        <section className="mx-auto flex w-full flex-col items-center gap-12 pt-[160px] text-center">
          <h1 className="w-full text-2xl font-semibold min-[480px]:text-3xl">
            사연 모집이 끝났어요
          </h1>
          <img
            alt=""
            className="aspect-[62/55] h-auto w-[69%] max-w-[344px] scale-[1.16] object-cover"
            src={lockIllustration}
          />
          <p className="w-full text-base font-medium min-[480px]:text-lg">
            축제 시작 시 신청한 사연이 낭독 돼요
          </p>
        </section>
      )}

      {storyPhase === "OPEN" && effectiveView === "intro" && (
        <section className="mx-auto w-full pt-10">
          <section aria-labelledby="story-event-heading" className="mt-20 text-center">
            <h1 className="text-xl font-semibold" id="story-event-heading">
              GROOVE 사연 모집 이벤트
            </h1>
          </section>
          <div className="mt-10 flex justify-center">
            <span
              aria-hidden="true"
              className="relative h-[221px] w-60 shrink-0 overflow-hidden"
            >
              <img
                alt=""
                className="absolute top-[-5.35%] left-[-28.65%] h-[114.47%] w-[156.45%] max-w-none"
                src={storyIconSprite}
              />
            </span>
          </div>
          <div className="mt-10">
            <button
              className="h-14 w-full rounded-2xl bg-[#ff0080] text-base font-semibold"
              onClick={handleOpenGuide}
              type="button"
            >
              GROOVE 사연 신청하기
            </button>
          </div>
        </section>
      )}

      {storyPhase === "OPEN" && effectiveView === "form" && canWriteStory && (
        <StoryForm
          isSubmitting={isSubmitting}
          onSubmit={handleSubmit}
          submitErrorMessage={submitErrorMessage}
        />
      )}

      {storyPhase === "OPEN" && effectiveView === "success" && (
        <section
          aria-live="polite"
          className="mx-auto mt-10 flex w-full flex-col items-center gap-10 text-center"
        >
          <img
            alt=""
            className="h-[235px] w-[223px] object-contain"
            src={letterIllustration}
          />
          <div className="flex flex-col items-center gap-3">
            <h1 className="text-2xl font-semibold">사연이 접수되었어요</h1>
            <p className="text-base font-medium">
              다시 제출하면 기존 사연이 새 내용으로 갱신돼요
            </p>
          </div>
          <button className="text-sm underline" onClick={showIntro} type="button">
            사연 모집 화면으로 돌아가기
          </button>
        </section>
      )}

      <StoryGuideModal
        authError={authError}
        authPending={authPending}
        isLoggedIn={canWriteStory}
        isLoginPending={isLoginPending}
        loginErrorMessage={loginErrorMessage}
        onClose={handleCloseGuide}
        onContinue={handleContinueToForm}
        onCredential={handleGoogleCredential}
        onRetryAuth={handleRetryAuth}
        open={guideOpen}
        wrongRole={wrongRole}
      />
    </main>
  );
}
