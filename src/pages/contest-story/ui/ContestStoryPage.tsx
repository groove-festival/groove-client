import { useQueryClient } from "@tanstack/react-query";
import {
  type CSSProperties,
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useSearchParams } from "react-router";

import {
  authQueryKeys,
  isGoogleParticipant,
  useAuthMe,
  useLoginWithGoogle,
} from "@/entities/auth";
import { useFestivalStatus } from "@/entities/festival";
import { ApiError } from "@/shared/api";
import { useScheduledRefetch } from "@/shared/lib/scheduling";
import {
  hourglassIllustration,
  letterIllustration,
  LoadingFallback,
  NetworkErrorFallback,
  lockIllustration,
  storyIconSprite,
} from "@/shared/ui";

import {
  type PublicContestStory,
  usePublicContestStories,
} from "../api/getPublicContestStories";
import { contestStoryQueryKeys } from "../api/queryKeys";
import {
  toSubmitContestStoryBody,
  useSubmitContestStory,
} from "../api/submitContestStory";
import { contestStorySubmitErrorMessage } from "../model/contestStoryErrorMessages";
import { googleLoginErrorMessage } from "../model/googleLoginErrorMessage";
import { scatterStoryTitles } from "../model/scatterStoryTitles";
import {
  createStoryCloudSeed,
  createStoryTitleAppearances,
  type StoryTitleAppearance,
} from "../model/storyTitleAppearance";
import { nextStoryBoundaryAt, parseStoryPhaseOverride } from "../model/storyPhase";
import { StoryForm } from "./StoryForm";
import { StoryGuideModal } from "./StoryGuideModal";

type StoryView = "list" | "form" | "success";
type StoryTitleStyle = CSSProperties & Record<`--${string}`, string>;

// 접수된 사연 제목 클라우드(빈 상태 포함)를 임시로 숨기고 아이콘으로 대신한다.
const SHOW_STORY_TITLE_CLOUD = false;
const storyCloudMinHeight = "clamp(340px, calc(100dvh - 470px), 500px)";
const previewStoryTitles = [
  "우리의 첫 축제",
  "밤하늘 아래서",
  "그날의 용기",
  "친구에게 전하는 말",
  "무대 뒤의 작은 약속",
  "함께 부른 노래",
  "오늘을 오래 기억할게",
  "별빛 속에서 만난 우리",
  "고마웠어, 정말",
  "다시 시작하는 밤",
  "졸업 전에 꼭 하고 싶은 이야기",
  "우리 과의 비밀 응원가",
];
const previewStories: PublicContestStory[] = previewStoryTitles.map((title, index) => ({
  storyId: -(index + 1),
  title,
  nickname: null,
  college: "IT",
  submittedAt: "2026-09-23T00:00:00+09:00",
}));

function storyTitleStyle(appearance: StoryTitleAppearance): StoryTitleStyle {
  return {
    "--story-drift-x": `${appearance.driftX.toFixed(1)}px`,
    "--story-drift-y": `${appearance.driftY.toFixed(1)}px`,
    "--story-rotate-from": `${appearance.fromRotate.toFixed(2)}deg`,
    "--story-rotate-to": `${appearance.toRotate.toFixed(2)}deg`,
    "--story-float-duration": `${appearance.duration.toFixed(2)}s`,
    "--story-float-delay": `${appearance.delay.toFixed(2)}s`,
    color: appearance.color,
    fontSize: appearance.fontSize,
    fontWeight: appearance.fontWeight,
    lineHeight: 1.05,
    maxWidth: "calc(min(100vw, 600px) - 48px)",
  };
}

function rotatedStoryTitleSize(
  width: number,
  height: number,
  appearance: StoryTitleAppearance,
  baseRotation: number,
): { height: number; rotation: number; width: number } {
  const bounds = [appearance.fromRotate, appearance.toRotate].map((offset) => {
    const degrees = baseRotation + offset;
    const radians = (Math.abs(degrees) * Math.PI) / 180;
    return {
      height:
        Math.abs(width * Math.sin(radians)) + Math.abs(height * Math.cos(radians)),
      width: Math.abs(width * Math.cos(radians)) + Math.abs(height * Math.sin(radians)),
    };
  });

  return {
    height:
      Math.ceil(Math.max(...bounds.map((item) => item.height))) +
      Math.ceil(Math.abs(appearance.driftY) * 2),
    rotation: baseRotation,
    width:
      Math.ceil(Math.max(...bounds.map((item) => item.width))) +
      Math.ceil(Math.abs(appearance.driftX) * 2),
  };
}

function storyTitleRotationCandidates(
  appearance: StoryTitleAppearance,
  index: number,
  titleWidth: number,
): number[] {
  const direction = appearance.seed % 2 === 0 ? 1 : -1;
  const diagonal = 45 + (appearance.seed % 19);
  const vertical = 76 + ((appearance.seed >>> 8) % 9);
  const rotatedCandidates =
    titleWidth >= 220
      ? [-direction * vertical]
      : [direction * diagonal, -direction * vertical];

  if (index % 4 === 0) return rotatedCandidates;
  if (index % 4 === 1) return [0, -direction * vertical];
  return [0, ...rotatedCandidates];
}

function StoryTitleTokens({ stories }: { stories: PublicContestStory[] }) {
  const listRef = useRef<HTMLUListElement>(null);
  const [cloudSeed] = useState(createStoryCloudSeed);
  const displayStories = useMemo(
    () => createStoryTitleAppearances(stories, cloudSeed),
    [cloudSeed, stories],
  );

  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;

    const wrappers = Array.from(list.children) as HTMLElement[];
    const tokens = wrappers.map((wrapper) => wrapper.firstElementChild as HTMLElement);
    let lastMeasurements = "";
    let active = true;

    const layout = () => {
      const width = list.clientWidth;
      if (!active || width === 0) return;

      const minimumHeight = Math.min(500, Math.max(340, window.innerHeight - 470));
      const sizes = tokens.map((token, index) => {
        const appearance = displayStories[index]!.appearance;
        const variants = storyTitleRotationCandidates(
          appearance,
          index,
          token.offsetWidth,
        ).map((rotation) =>
          rotatedStoryTitleSize(
            token.offsetWidth,
            token.offsetHeight,
            appearance,
            rotation,
          ),
        );
        const baseVariant = variants[0]!;

        return {
          height: baseVariant.height,
          seed: appearance.seed,
          variants,
          width: baseVariant.width,
        };
      });
      const measurements = `${width}:${minimumHeight}:${sizes.map(({ width: tokenWidth, height }) => `${tokenWidth}x${height}`).join(",")}`;
      if (measurements === lastMeasurements) return;
      lastMeasurements = measurements;

      const scattered = scatterStoryTitles(sizes, width, minimumHeight);
      list.style.height = `${scattered.height}px`;
      wrappers.forEach((wrapper, index) => {
        const placement = scattered.placements[index]!;
        const appearance = displayStories[index]!.appearance;
        const token = tokens[index]!;
        wrapper.style.left = `${placement.left}px`;
        wrapper.style.top = `${placement.top}px`;
        wrapper.style.width = `${placement.width}px`;
        wrapper.style.height = `${placement.height}px`;
        token.style.setProperty(
          "--story-rotate-from",
          `${(placement.rotation + appearance.fromRotate).toFixed(2)}deg`,
        );
        token.style.setProperty(
          "--story-rotate-to",
          `${(placement.rotation + appearance.toRotate).toFixed(2)}deg`,
        );
      });
    };

    layout();
    window.addEventListener("resize", layout);
    void document.fonts?.ready.then(layout);

    return () => {
      active = false;
      window.removeEventListener("resize", layout);
    };
  }, [displayStories]);

  return (
    <ul
      aria-label="접수된 사연 제목"
      className="relative mt-6 min-h-[340px] w-full text-center"
      ref={listRef}
      style={{ minHeight: storyCloudMinHeight }}
    >
      {displayStories.map(({ appearance, story }) => (
        <li
          className="absolute top-0 left-0 flex items-center justify-center"
          key={story.storyId}
        >
          <span
            className="block w-max font-semibold [overflow-wrap:anywhere] break-keep drop-shadow-[0_0_12px_rgba(255,255,255,0.18)] motion-safe:[animation:contest-story-float_var(--story-float-duration)_ease-in-out_var(--story-float-delay)_infinite]"
            data-testid="contest-story-title"
            style={storyTitleStyle(appearance)}
          >
            {story.title}
          </span>
        </li>
      ))}
    </ul>
  );
}

function PublicStoryTitleCloud({
  isError,
  isPending,
  onRetry,
  stories,
}: {
  isError: boolean;
  isPending: boolean;
  onRetry: () => void;
  stories: PublicContestStory[] | undefined;
}) {
  if (isPending) {
    return (
      <div
        aria-label="접수된 사연 제목"
        className="mt-6 flex min-h-[340px] items-center justify-center text-center text-sm text-[#a2a2a2]"
        style={{ minHeight: storyCloudMinHeight }}
      >
        사연 목록을 불러오는 중입니다
      </div>
    );
  }

  if (isError) {
    return (
      <div
        aria-label="접수된 사연 제목"
        className="mt-6 flex min-h-[340px] flex-col items-center justify-center gap-4 text-center text-sm text-[#a2a2a2]"
        style={{ minHeight: storyCloudMinHeight }}
      >
        <p>사연 목록을 불러오지 못했어요.</p>
        <button className="text-sm underline" onClick={onRetry} type="button">
          다시 불러오기
        </button>
      </div>
    );
  }

  if (!stories?.length) {
    return (
      <div
        aria-label="접수된 사연 제목"
        className="mt-6 flex min-h-[340px] items-center justify-center text-center text-sm text-[#a2a2a2]"
        style={{ minHeight: storyCloudMinHeight }}
      >
        아직 접수된 사연이 없어요
      </div>
    );
  }

  return <StoryTitleTokens stories={stories} />;
}

export default function ContestStoryPage() {
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const status = useFestivalStatus();
  const override = parseStoryPhaseOverride(searchParams.get("phase"));
  const storyPhase = override ?? status.data?.stage?.storyPhase;
  const isStoryPreview =
    import.meta.env.DEV &&
    storyPhase === "OPEN" &&
    searchParams.get("preview") === "stories";
  const stories = usePublicContestStories(storyPhase === "OPEN" && !isStoryPreview);
  const auth = useAuthMe();
  const {
    mutate: loginWithGoogle,
    isPending: isLoginPending,
    error: loginError,
    reset: resetGoogleLogin,
  } = useLoginWithGoogle();
  const submitStory = useSubmitContestStory();
  const [view, setView] = useState<StoryView>("list");
  const [guideOpen, setGuideOpen] = useState(false);
  const guideOpenRef = useRef(false);
  const [hasGoogleLogin, setHasGoogleLogin] = useState(false);
  const [submitErrorMessage, setSubmitErrorMessage] = useState<string | undefined>();
  const isLoggedInContestUser = isGoogleParticipant(auth.data);
  const canWriteStory = isLoggedInContestUser || hasGoogleLogin;
  const wrongRole = auth.data?.loggedIn === true && auth.data.role !== "USER";

  useScheduledRefetch(
    override ? undefined : nextStoryBoundaryAt(storyPhase, status.data?.stage),
    status.refetch,
  );

  const handleGoogleCredential = useCallback(
    (idToken: string) => {
      loginWithGoogle(idToken, {
        onSuccess: () => {
          if (!guideOpenRef.current) return;

          guideOpenRef.current = false;
          setHasGoogleLogin(true);
          setGuideOpen(false);
          setView("form");
        },
      });
    },
    [loginWithGoogle],
  );

  const handleCloseGuide = useCallback(() => {
    guideOpenRef.current = false;
    setGuideOpen(false);
  }, []);

  const handleContinueToForm = useCallback(() => {
    guideOpenRef.current = false;
    setGuideOpen(false);
    setView("form");
  }, []);

  const handleRetryAuth = useCallback(() => {
    void auth.refetch();
  }, [auth]);

  const handleSubmit = async (
    values: Parameters<typeof toSubmitContestStoryBody>[0],
  ) => {
    setSubmitErrorMessage(undefined);
    try {
      await submitStory.mutateAsync(toSubmitContestStoryBody(values));
      void queryClient.invalidateQueries({ queryKey: contestStoryQueryKeys.list() });
      setView("success");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      if (error instanceof ApiError && error.code === "C003") {
        void queryClient.invalidateQueries({ queryKey: authQueryKeys.me() });
        setHasGoogleLogin(false);
        setView("list");
        resetGoogleLogin();
        guideOpenRef.current = true;
        setGuideOpen(true);
      }
      setSubmitErrorMessage(contestStorySubmitErrorMessage(error));
    }
  };

  const effectiveView =
    storyPhase === "OPEN" && (view !== "form" || canWriteStory) ? view : "list";

  if (!storyPhase && status.isPending) {
    return <LoadingFallback />;
  }

  if (!storyPhase && status.isError) {
    return <NetworkErrorFallback />;
  }

  return (
    <main
      className={`relative w-full bg-[#1c1c1c] px-4 pt-20 text-[#fcfcfc] ${
        // 모집 목록 화면은 신청하기 버튼 바로 아래에 푸터가 오도록 여백을 줄인다.
        storyPhase === "OPEN" && effectiveView === "list"
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

      {storyPhase === "OPEN" && effectiveView === "list" && (
        <section className="mx-auto w-full pt-10">
          {/* 헤더(80px) 아래로 120px 떨어뜨린다 (section pt-10 + mt-20). */}
          <section aria-labelledby="story-event-heading" className="mt-20 text-center">
            <h1 className="text-xl font-semibold" id="story-event-heading">
              GROOVE 사연 모집 이벤트
            </h1>
          </section>
          {SHOW_STORY_TITLE_CLOUD ? (
            <>
              {isStoryPreview && (
                <p className="mt-8 text-xs text-[#cfff04]">예시 미리보기</p>
              )}
              <PublicStoryTitleCloud
                isError={!isStoryPreview && stories.isError}
                isPending={!isStoryPreview && stories.isPending}
                onRetry={() => void stories.refetch()}
                stories={isStoryPreview ? previewStories : stories.data}
              />
            </>
          ) : (
            // 메인 사연신청 바로가기와 같은 스프라이트 크롭을 크게 키운다.
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
          )}
          <div className="mt-10">
            <button
              className="h-14 w-full rounded-2xl bg-[#ff0080] text-base font-semibold"
              onClick={() => {
                setSubmitErrorMessage(undefined);
                submitStory.reset();
                resetGoogleLogin();
                guideOpenRef.current = true;
                setGuideOpen(true);
              }}
              type="button"
            >
              GROOVE 사연 신청하기
            </button>
          </div>
        </section>
      )}

      {storyPhase === "OPEN" && effectiveView === "form" && canWriteStory && (
        <StoryForm
          isSubmitting={submitStory.isPending}
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
          <button
            className="text-sm underline"
            onClick={() => setView("list")}
            type="button"
          >
            사연 신청 목록 보기
          </button>
        </section>
      )}

      <StoryGuideModal
        authError={auth.isError}
        authPending={auth.isPending}
        isLoggedIn={canWriteStory}
        isLoginPending={isLoginPending}
        loginErrorMessage={
          loginError == null ? undefined : googleLoginErrorMessage(loginError)
        }
        onClose={handleCloseGuide}
        onContinue={handleContinueToForm}
        onCredential={handleGoogleCredential}
        onRetryAuth={handleRetryAuth}
        open={guideOpen && storyPhase === "OPEN"}
        wrongRole={wrongRole}
      />
    </main>
  );
}
