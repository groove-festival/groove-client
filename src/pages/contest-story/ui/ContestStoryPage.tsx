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
import microphone from "../festival-visuals/microphone.png";
import { contestStorySubmitErrorMessage } from "../model/contestStoryErrorMessages";
import { googleLoginErrorMessage } from "../model/googleLoginErrorMessage";
import { scatterStoryTitles } from "../model/scatterStoryTitles";
import { nextStoryBoundaryAt, parseStoryPhaseOverride } from "../model/storyPhase";
import { GoogleSignInButton } from "./GoogleSignInButton";
import { StoryForm } from "./StoryForm";

type StoryView = "list" | "form" | "success";
type StoryTitleStyle = CSSProperties & Record<`--${string}`, string>;

const titleCloudFontSizes = ["1rem", "1.125rem", "1.25rem", "1.5rem", "1.75rem"];
const titleCloudFontWeights = [520, 620, 720, 820, 900];
const titleCloudColors = ["#ff0080", "#00ffff", "#fcfcfc", "#cfff04", "#ff2e9a"];
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

function hashStorySeed(story: Pick<PublicContestStory, "storyId" | "title">): number {
  const source = `${story.storyId}:${story.title}`;
  let hash = 0;

  for (let index = 0; index < source.length; index += 1) {
    hash = (hash * 31 + source.charCodeAt(index)) >>> 0;
  }

  return hash;
}

function getSeedValue(seed: number, salt: number, min: number, max: number): number {
  const normalized = ((seed * (salt * 17 + 23)) % 10_000) / 10_000;

  return min + normalized * (max - min);
}

function storyTitleStyle(story: PublicContestStory): StoryTitleStyle {
  const seed = hashStorySeed(story);
  const fontSize = titleCloudFontSizes[seed % titleCloudFontSizes.length];
  const fontWeight =
    titleCloudFontWeights[Math.floor(seed / 7) % titleCloudFontWeights.length];
  const color = titleCloudColors[Math.floor(seed / 11) % titleCloudColors.length];
  const driftX = getSeedValue(seed, 3, -7, 7).toFixed(1);
  const driftY = getSeedValue(seed, 5, -12, -5).toFixed(1);
  const fromRotate = getSeedValue(seed, 7, -4, 4).toFixed(2);
  const toRotate = getSeedValue(seed, 9, -5, 5).toFixed(2);
  const duration = getSeedValue(seed, 11, 2.6, 4.8).toFixed(2);
  const delay = getSeedValue(seed, 13, -2.4, 0).toFixed(2);

  return {
    "--story-drift-x": `${driftX}px`,
    "--story-drift-y": `${driftY}px`,
    "--story-rotate-from": `${fromRotate}deg`,
    "--story-rotate-to": `${toRotate}deg`,
    "--story-float-duration": `${duration}s`,
    "--story-float-delay": `${delay}s`,
    color,
    fontSize,
    fontWeight,
    lineHeight: 1.05,
  };
}

function StoryTitleTokens({ stories }: { stories: PublicContestStory[] }) {
  const listRef = useRef<HTMLUListElement>(null);
  const displayStories = useMemo(
    () =>
      [...stories].sort(
        (first, second) => hashStorySeed(first) - hashStorySeed(second),
      ),
    [stories],
  );

  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;

    const tokens = Array.from(list.children) as HTMLElement[];
    let lastMeasurements = "";
    let active = true;

    const layout = () => {
      const width = list.clientWidth;
      if (!active || width === 0) return;

      const sizes = tokens.map((token, index) => ({
        width: token.offsetWidth,
        height: token.offsetHeight,
        seed: hashStorySeed(displayStories[index]!),
      }));
      const measurements = `${width}:${sizes.map(({ width: tokenWidth, height }) => `${tokenWidth}x${height}`).join(",")}`;
      if (measurements === lastMeasurements) return;
      lastMeasurements = measurements;

      const scattered = scatterStoryTitles(sizes, width);
      list.style.height = `${scattered.height}px`;
      tokens.forEach((token, index) => {
        const placement = scattered.placements[index]!;
        token.style.left = `${placement.left}px`;
        token.style.top = `${placement.top}px`;
      });
    };

    layout();
    const observer =
      typeof ResizeObserver === "undefined" ? null : new ResizeObserver(layout);
    observer?.observe(list);
    tokens.forEach((token) => observer?.observe(token));
    void document.fonts?.ready.then(layout);

    return () => {
      active = false;
      observer?.disconnect();
    };
  }, [displayStories]);

  return (
    <ul
      aria-label="접수된 사연 제목"
      className="relative mt-12 min-h-[336px] w-full text-center"
      ref={listRef}
    >
      {displayStories.map((story) => (
        <li
          className="absolute top-0 left-0 w-max max-w-[calc(100%-16px)] font-semibold [overflow-wrap:anywhere] break-keep drop-shadow-[0_0_12px_rgba(255,255,255,0.18)] motion-safe:[animation:contest-story-float_var(--story-float-duration)_ease-in-out_var(--story-float-delay)_infinite]"
          data-testid="contest-story-title"
          key={story.storyId}
          style={storyTitleStyle(story)}
        >
          {story.title}
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
        className="mt-[84px] flex min-h-[300px] items-center justify-center text-center text-sm text-[#a2a2a2]"
      >
        사연 목록을 불러오는 중입니다
      </div>
    );
  }

  if (isError) {
    return (
      <div
        aria-label="접수된 사연 제목"
        className="mt-[84px] flex min-h-[300px] flex-col items-center justify-center gap-4 text-center text-sm text-[#a2a2a2]"
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
        className="mt-[84px] flex min-h-[300px] items-center justify-center text-center text-sm text-[#a2a2a2]"
      >
        아직 접수된 사연이 없어요
      </div>
    );
  }

  return <StoryTitleTokens stories={stories} />;
}

function StoryLoginPanel({
  authError,
  authPending,
  isLoginPending,
  loginError,
  onCredential,
  onRetryAuth,
  wrongRole,
}: {
  authError: boolean;
  authPending: boolean;
  isLoginPending: boolean;
  loginError: unknown;
  onCredential: (credential: string) => void;
  onRetryAuth: () => void;
  wrongRole: boolean;
}) {
  return (
    <section className="mx-auto mt-20 flex w-full flex-col gap-6">
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold">Google 로그인</h1>
        <p className="text-sm leading-6 text-[#a2a2a2]">
          <span className="block">사연은 Google 계정당 하나만 접수할 수 있어요.</span>
          <span className="block">
            다시 제출하면 기존 사연이 새 내용으로 덮어쓰기돼요.
          </span>
        </p>
        <p className="text-sm leading-6 text-[#a2a2a2]">
          <span className="block">학교 계정이 아니어도 참여할 수 있어요.</span>
          <span className="block">1인 1회 참여 원칙을 위해</span>
          <span className="block">Google 로그인과 학번 입력을 부탁드려요.</span>
        </p>
      </div>

      {authPending && (
        <p className="text-sm text-[#a2a2a2]" role="status">
          로그인 상태를 확인하는 중입니다
        </p>
      )}
      {authError && (
        <div className="flex flex-col gap-3 rounded-2xl border border-[#ff5b5b] bg-[#323232] p-4">
          <p className="text-sm text-[#ff9ab0]">로그인 상태를 확인하지 못했어요.</p>
          <button
            className="text-left text-sm underline"
            onClick={onRetryAuth}
            type="button"
          >
            다시 확인하기
          </button>
        </div>
      )}
      {wrongRole && (
        <p className="rounded-2xl border border-[#565656] bg-[#323232] p-4 text-xs leading-5 text-[#cfcfcf]">
          현재 계정은 가요제 참여자 계정이 아니에요. Google 계정으로 로그인해 주세요.
        </p>
      )}

      <GoogleSignInButton disabled={isLoginPending} onCredential={onCredential} />
      <p className="text-xs leading-5 text-[#a2a2a2]">
        <span className="block">Google 비밀번호는 GROOVE에 전달되지 않아요.</span>
        <span className="block">
          Google에서 발급한 인증 정보로 로그인 상태만 확인해요.
        </span>
      </p>

      {isLoginPending && (
        <p className="text-sm text-[#a2a2a2]" role="status">
          Google 로그인을 처리하는 중입니다
        </p>
      )}
      {loginError != null && (
        <p className="text-xs leading-[15px] text-[#ff5b5b]" role="alert">
          {googleLoginErrorMessage(loginError)}
        </p>
      )}
    </section>
  );
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
  } = useLoginWithGoogle();
  const submitStory = useSubmitContestStory();
  const [view, setView] = useState<StoryView>("list");
  const [guideOpen, setGuideOpen] = useState(false);
  const [submitErrorMessage, setSubmitErrorMessage] = useState<string | undefined>();

  useScheduledRefetch(
    override ? undefined : nextStoryBoundaryAt(storyPhase, status.data?.stage),
    status.refetch,
  );

  const handleGoogleCredential = useCallback(
    (idToken: string) => {
      loginWithGoogle(idToken);
    },
    [loginWithGoogle],
  );

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
      }
      setSubmitErrorMessage(contestStorySubmitErrorMessage(error));
    }
  };

  const isLoggedInContestUser = isGoogleParticipant(auth.data);
  const wrongRole = auth.data?.loggedIn === true && auth.data.role !== "USER";
  const effectiveView = storyPhase === "OPEN" ? view : "list";

  if (!storyPhase && status.isPending) {
    return <LoadingFallback />;
  }

  if (!storyPhase && status.isError) {
    return <NetworkErrorFallback />;
  }

  return (
    <main className="relative min-h-[calc(100dvh-64px)] w-full bg-[#1c1c1c] px-4 pt-20 pb-24 text-[#fcfcfc]">
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
        <section className="mx-auto w-full pt-[120px]">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h1 className="text-2xl font-bold">사연 신청 목록</h1>
            {isStoryPreview && (
              <span className="text-xs text-[#cfff04]">예시 미리보기</span>
            )}
          </div>
          <PublicStoryTitleCloud
            isError={!isStoryPreview && stories.isError}
            isPending={!isStoryPreview && stories.isPending}
            onRetry={() => void stories.refetch()}
            stories={isStoryPreview ? previewStories : stories.data}
          />
          <div className="mt-[84px] flex flex-col gap-6">
            <section
              aria-labelledby="story-event-heading"
              className="flex flex-col gap-2 text-center"
            >
              <h2 className="text-lg font-semibold" id="story-event-heading">
                GROOVE 사연 모집 이벤트
              </h2>
              <p className="text-sm leading-6 text-[#cfcfcf]">
                <span className="block">
                  신청한 사연은 축제 무대에서 MC가 소개합니다.
                </span>
                <span className="block">함께 나누고 싶은 이야기를 남겨 주세요.</span>
              </p>
            </section>
            <button
              className="h-14 w-full rounded-2xl bg-[#ff0080] text-base font-semibold"
              onClick={() => {
                setSubmitErrorMessage(undefined);
                submitStory.reset();
                setGuideOpen(true);
              }}
              type="button"
            >
              신청하기
            </button>
          </div>
        </section>
      )}

      {storyPhase === "OPEN" && effectiveView === "form" && !isLoggedInContestUser && (
        <StoryLoginPanel
          authError={auth.isError}
          authPending={auth.isPending}
          isLoginPending={isLoginPending}
          loginError={loginError}
          onCredential={handleGoogleCredential}
          onRetryAuth={() => void auth.refetch()}
          wrongRole={wrongRole}
        />
      )}

      {storyPhase === "OPEN" && effectiveView === "form" && isLoggedInContestUser && (
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
            className="h-[261px] w-[248px] object-contain"
            src={letterIllustration}
          />
          <h1 className="text-2xl font-semibold">사연이 접수되었어요</h1>
          <p className="text-base font-medium">
            다시 제출하면 기존 사연이 새 내용으로 갱신돼요
          </p>
          <button
            className="text-sm underline"
            onClick={() => setView("list")}
            type="button"
          >
            사연 신청 목록 보기
          </button>
        </section>
      )}

      {guideOpen && storyPhase === "OPEN" && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setGuideOpen(false);
          }}
        >
          <section
            aria-label="사연 신청 안내 사항"
            aria-modal="true"
            className="relative flex max-h-[calc(100dvh-32px)] w-[320px] max-w-full flex-col items-center overflow-y-auto rounded-[36px] bg-[#bbb4ae] px-8 pt-[52px] pb-8 text-[#fcfcfc] shadow-xl"
            role="dialog"
          >
            <button
              aria-label="안내 닫기"
              className="absolute top-6 right-6 size-5"
              onClick={() => setGuideOpen(false)}
              type="button"
            >
              <svg
                aria-hidden="true"
                className="size-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                viewBox="0 0 20 20"
              >
                <path d="M1 1l18 18M19 1 1 19" />
              </svg>
            </button>
            <img
              alt=""
              className="h-[83px] w-20 shrink-0 object-contain"
              src={microphone}
            />
            <h2 className="mt-3 w-full text-center text-2xl font-semibold">
              사연 신청 안내 사항
            </h2>
            <ul className="mt-7 w-full list-disc space-y-4 pl-6 text-xs leading-[15px]">
              <li>신청한 사연은 무대 진행 중 MC가 낭독하는 이벤트입니다.</li>
              <li>별명을 입력하지 않을 경우, 본명으로 사연을 소개합니다.</li>
              <li>한 계정당 하나의 사연만 등록할 수 있습니다.</li>
              <li>실제 신청에는 Google 로그인이 필요합니다.</li>
            </ul>
            <button
              className="mt-7 h-14 w-full shrink-0 rounded-2xl bg-[#ff0080] text-base font-semibold"
              onClick={() => {
                setGuideOpen(false);
                setView("form");
              }}
              type="button"
            >
              사연 작성하기
            </button>
          </section>
        </div>
      )}
    </main>
  );
}
