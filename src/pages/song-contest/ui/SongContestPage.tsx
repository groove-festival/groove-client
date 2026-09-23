import { useQueryClient } from "@tanstack/react-query";
import {
  type ReactNode,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { useSearchParams } from "react-router";

import { authQueryKeys, isGoogleParticipant, useAuthMe, useLoginWithGoogle } from "@/entities/auth";
import { useVotes } from "@/entities/contest";
import { useFestivalStatus } from "@/entities/festival";
import { ApiError } from "@/shared/api";
import { useScheduledRefetch } from "@/shared/lib/scheduling";
import { LoadingFallback, NetworkErrorFallback, lockIllustration } from "@/shared/ui";

import {
  type PublicContestStory,
  usePublicContestStories,
} from "../api/getPublicContestStories";
import { songContestQueryKeys } from "../api/queryKeys";
import {
  toSubmitContestStoryBody,
  useSubmitContestStory,
} from "../api/submitContestStory";
import hourglass from "../festival-visuals/hourglass.png";
import letter from "../festival-visuals/letter.png";
import microphone from "../festival-visuals/microphone.png";
import { contestStorySubmitErrorMessage } from "../model/contestStoryErrorMessages";
import { googleLoginErrorMessage } from "../model/googleLoginErrorMessage";
import { nextContestBoundaryAt } from "../model/nextContestBoundaryAt";
import { formatRemainingMinutes } from "../model/remainingMinutes";
import { scatterStoryTitles } from "../model/scatterStoryTitles";
import { nextStoryBoundaryAt, parseStoryPhaseOverride } from "../model/storyPhase";
import {
  currentTimetableIndex,
  nextTimetableBoundary,
  timetable,
} from "../model/timetable";
import { BracketMatchRow } from "./BracketMatchRow";
import { ContestBeforeNotice } from "./ContestBeforeNotice";
import { ContestClosedNotice } from "./ContestClosedNotice";
import { ContestResults } from "./ContestResults";
import { GoogleSignInButton } from "./GoogleSignInButton";
import { StoryForm } from "./StoryForm";
import { VoteCastingPanel } from "./VoteCastingPanel";

type Tab = "timetable" | "votes";
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

function ContestOverview({
  tab,
  onTabChange,
  votesTabLabel,
  votesTabContent,
}: {
  tab: Tab;
  onTabChange: (tab: Tab) => void;
  votesTabLabel: string;
  votesTabContent: ReactNode;
}) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const scrollContentRef = useRef<HTMLDivElement>(null);
  const timetableItemRefs = useRef<(HTMLLIElement | null)[]>([]);
  const [isScrollable, setIsScrollable] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [nowMs, setNowMs] = useState(() => Date.now());
  const currentIndex = currentTimetableIndex(nowMs);

  useEffect(() => {
    const nextAt = nextTimetableBoundary(nowMs);
    if (nextAt === undefined) return;

    const delay = Math.min(Math.max(nextAt - Date.now(), 0), 2_147_483_647);
    const timer = window.setTimeout(() => setNowMs(Date.now()), delay);

    return () => window.clearTimeout(timer);
  }, [nowMs]);

  useEffect(() => {
    const syncTime = () => setNowMs(Date.now());
    window.addEventListener("focus", syncTime);
    document.addEventListener("visibilitychange", syncTime);

    return () => {
      window.removeEventListener("focus", syncTime);
      document.removeEventListener("visibilitychange", syncTime);
    };
  }, []);

  const updateScrollState = useCallback(() => {
    const scrollArea = scrollAreaRef.current;
    if (!scrollArea) return;

    const scrollableDistance = scrollArea.scrollHeight - scrollArea.clientHeight;
    setIsScrollable(scrollableDistance > 4);
    setScrollProgress(
      scrollableDistance > 0
        ? Math.min(Math.max(scrollArea.scrollTop / scrollableDistance, 0), 1)
        : 0,
    );
  }, []);

  useLayoutEffect(() => {
    updateScrollState();

    const scrollContent = scrollContentRef.current;
    if (!scrollContent || typeof ResizeObserver === "undefined") return;

    const resizeObserver = new ResizeObserver(updateScrollState);
    resizeObserver.observe(scrollContent);

    return () => resizeObserver.disconnect();
  }, [tab, updateScrollState]);

  useLayoutEffect(() => {
    if (tab !== "timetable" || currentIndex === null || currentIndex === 0) return;

    const scrollArea = scrollAreaRef.current;
    const currentItem = timetableItemRefs.current[currentIndex];
    if (!scrollArea || !currentItem) return;

    const areaRect = scrollArea.getBoundingClientRect();
    const itemRect = currentItem.getBoundingClientRect();
    const centeredTop = Math.round(
      scrollArea.scrollTop +
        itemRect.top -
        areaRect.top +
        itemRect.height / 2 -
        scrollArea.clientHeight / 2,
    );
    const maxScrollTop = Math.max(0, scrollArea.scrollHeight - scrollArea.clientHeight);
    const top = Math.min(Math.max(centeredTop, 0), maxScrollTop);

    if (Math.abs(top - scrollArea.scrollTop) >= 1) {
      scrollArea.scrollTo({ top, behavior: "smooth" });
    }
  }, [currentIndex, tab]);

  const handleTabChange = (nextTab: Tab) => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = 0;
    }
    setScrollProgress(0);
    onTabChange(nextTab);
  };

  const handleScroll = () => {
    updateScrollState();
  };

  return (
    <section
      aria-label="가요제 일정과 경연"
      className="mx-auto mt-[100px] h-[392px] w-full rounded-3xl border border-[#565656] bg-[rgba(252,252,252,0.1)] px-3 pt-4 pb-5"
    >
      <div aria-label="가요제 보기" className="flex h-[43px] gap-3" role="tablist">
        {(["timetable", "votes"] as const).map((item) => (
          <button
            aria-controls="contest-panel"
            aria-selected={tab === item}
            className={`min-w-0 flex-1 rounded-full text-base font-semibold ${tab === item ? "bg-[rgba(255,0,128,0.8)] text-[#fcfcfc]" : "text-[#a2a2a2]"}`}
            key={item}
            onClick={() => handleTabChange(item)}
            role="tab"
            type="button"
          >
            {item === "timetable" ? "타임테이블" : votesTabLabel}
          </button>
        ))}
      </div>
      <div className="relative mt-5 h-[292px]">
        <div
          aria-label={tab === "timetable" ? "가요제 타임테이블" : votesTabLabel}
          className="h-full touch-pan-y [scrollbar-width:none] overflow-y-auto overscroll-contain [&::-webkit-scrollbar]:hidden"
          id="contest-panel"
          onScroll={handleScroll}
          ref={scrollAreaRef}
          role="tabpanel"
        >
          <div ref={scrollContentRef}>
            {tab === "timetable" ? (
              <ol className="relative ml-2 space-y-3 border-l-2 border-[#a2a2a2] pb-[146px] pl-[22px]">
                {timetable.map((item, index) => (
                  <li
                    className="relative"
                    key={`${item.time}-${item.title}`}
                    ref={(element) => {
                      timetableItemRefs.current[index] = element;
                    }}
                  >
                    <span
                      className={`absolute top-[21px] -left-[31px] size-4 rounded-full border border-[#fcfcfc] ${index === currentIndex ? "bg-[#ff0080]" : "bg-[#767676]"}`}
                    />
                    <div
                      className={`flex min-h-[61px] items-center justify-between gap-2 rounded-2xl border p-4 ${index === currentIndex ? "border-[#ff0080] bg-[rgba(255,0,128,0.8)]" : "border-[#fcfcfc] bg-[#767676] text-[#cfcfcf]"}`}
                    >
                      <span className="text-sm font-semibold">{item.title}</span>
                      <time className="shrink-0 text-sm font-semibold">
                        {item.time}
                      </time>
                    </div>
                  </li>
                ))}
              </ol>
            ) : (
              votesTabContent
            )}
          </div>
        </div>

        {isScrollable && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-1 right-0 bottom-1 w-1 rounded-full bg-[#fcfcfc]/10"
          >
            <span
              className={`block h-[60px] w-1 rounded-full bg-[#fcfcfc]/70 ${scrollProgress === 0 ? "motion-safe:[animation:contest-scroll-nudge_1.8s_ease-in-out_infinite]" : ""}`}
              data-testid="contest-scroll-thumb"
              style={{ transform: `translateY(${scrollProgress * 224}px)` }}
            />
          </div>
        )}
      </div>
    </section>
  );
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

function ContestLoginPanel({
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
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">Google 로그인</h1>
        <p className="text-sm leading-6 text-[#a2a2a2]">
          <span className="block">사연은 Google 계정당 하나만 접수할 수 있어요.</span>
          <span className="block">다시 제출하면 기존 사연이 새 내용으로 바뀝니다.</span>
        </p>
        <p className="text-sm leading-6 text-[#a2a2a2]">
          학교 계정이 아니어도 참여할 수 있어요. 1인 1회 참여 원칙을 위해 Google
          로그인과 학번 입력을 부탁드려요.
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
          Google에서 발급한 인증 정보로 로그인 상태를 확인합니다.
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

export default function SongContestPage() {
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
  const [tab, setTab] = useState<Tab>("timetable");
  const [view, setView] = useState<StoryView>("list");
  const [guideOpen, setGuideOpen] = useState(false);
  const [submitErrorMessage, setSubmitErrorMessage] = useState<string | undefined>();

  const contestPhase = status.data?.stage.contestPhase;
  const votesQuery = useVotes();
  const votes = votesQuery.data ?? [];

  useScheduledRefetch(
    override ? undefined : nextStoryBoundaryAt(storyPhase, status.data?.stage),
    status.refetch,
  );
  useScheduledRefetch(
    status.data ? nextContestBoundaryAt(contestPhase, status.data.stage) : undefined,
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
      void queryClient.invalidateQueries({ queryKey: songContestQueryKeys.stories() });
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

  const votesTabLabel = contestPhase === "CLOSED" ? "경연 결과" : "경연 목록";

  const votesTabContent: ReactNode =
    status.isPending || votesQuery.isPending ? (
      <p className="pt-32 text-center text-base text-[#a2a2a2]">불러오는 중…</p>
    ) : status.isError || votesQuery.isError ? (
      <p className="pt-32 text-center text-base text-[#a2a2a2]">
        경연 목록을 불러오지 못했어요.
      </p>
    ) : contestPhase === "BEFORE" ? (
      <p className="pt-32 text-center text-base">아직 경연이 시작되지 않았어요</p>
    ) : (
      <ol className="space-y-6">
        {votes.map((vote) => (
          <li key={vote.singingVoteId}>
            <BracketMatchRow
              metaLabel={
                vote.status === "OPEN"
                  ? formatRemainingMinutes(vote.endsAt, new Date())
                  : undefined
              }
              showWinnerBadge={contestPhase === "CLOSED"}
              vote={vote}
            />
          </li>
        ))}
      </ol>
    );

  const height =
    effectiveView === "form" && storyPhase === "OPEN"
      ? 1764
      : effectiveView === "success" && storyPhase === "OPEN"
        ? 1157
        : storyPhase === "BEFORE"
          ? 1216
          : storyPhase === "CLOSED"
            ? 1228
            : 1352;

  return (
    <main
      className="relative mx-auto w-full max-w-[600px] bg-[#1c1c1c] px-4 text-[#fcfcfc]"
      style={{ minHeight: height }}
    >
      <ContestOverview
        onTabChange={setTab}
        tab={tab}
        votesTabContent={votesTabContent}
        votesTabLabel={votesTabLabel}
      />

      {storyPhase === "BEFORE" && (
        <section className="mx-auto mt-40 flex w-full flex-col items-center gap-12 text-center">
          <h1 className="text-2xl font-semibold">사연 모집이 아직이에요</h1>
          <img alt="" className="h-[208px] w-[260px] object-contain" src={hourglass} />
          <p className="text-base font-medium">곧 사연 모집이 시작 됩니다!</p>
        </section>
      )}

      {storyPhase === "CLOSED" && (
        <section className="mx-auto mt-40 flex w-full flex-col items-center gap-12 text-center">
          <h1 className="text-2xl font-semibold">사연 모집이 끝났어요</h1>
          <img
            alt=""
            className="h-[220px] w-[248px] scale-[1.16] object-cover"
            src={lockIllustration}
          />
          <p className="text-base font-medium">축제 시작 시 신청한 사연이 낭독 돼요</p>
        </section>
      )}

      {storyPhase === "OPEN" && effectiveView === "list" && (
        <section className="mx-auto mt-20 w-full">
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
          <button
            className="mt-[84px] h-14 w-full rounded-2xl bg-[#ff0080] text-base font-semibold"
            onClick={() => {
              setSubmitErrorMessage(undefined);
              submitStory.reset();
              setGuideOpen(true);
            }}
            type="button"
          >
            신청하기
          </button>
        </section>
      )}

      {storyPhase === "OPEN" && effectiveView === "form" && !isLoggedInContestUser && (
        <ContestLoginPanel
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
          className="mx-auto mt-[120px] flex w-full flex-col items-center gap-10 text-center"
        >
          <img alt="" className="h-[261px] w-[248px] object-contain" src={letter} />
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

      {contestPhase === "BEFORE" && <ContestBeforeNotice />}

      {contestPhase === "CLOSED" && <ContestClosedNotice />}

      {contestPhase === "OPEN" && (
        <div className="mx-auto mt-10 mb-24 flex w-full max-w-[361px] flex-col gap-6">
          <VoteCastingPanel />
          <ContestResults votes={votes} />
        </div>
      )}

      <p className="absolute bottom-10 left-0 w-full text-center text-[10px] leading-3 text-[#a2a2a2]">
        자세한 소식과 문의는 GROOVE 축제 공식 SNS에서 확인해 주세요.
      </p>

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
