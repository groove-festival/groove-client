import { useRef, useState } from "react";
import { useSearchParams } from "react-router";

import { lockIllustration } from "@/shared/ui";

import hourglass from "../festival-visuals/hourglass.png";
import letter from "../festival-visuals/letter.png";
import microphone from "../festival-visuals/microphone.png";
import { StoryForm } from "./StoryForm";

type Tab = "timetable" | "votes";
type StoryView = "list" | "form" | "success";
type PreviewPhase = "before" | "open" | "closed";

// 10/2 가요제 순서. 서버 타임테이블 연동 전 화면 미리보기용 고정 콘텐츠다.
const timetable = [
  { time: "18:00", title: "가요제 오프닝" },
  { time: "18:10", title: "밴드동아리 축하 공연" },
  { time: "19:00", title: "가요제 1라운드" },
  { time: "20:00", title: "댄스동아리 축하 공연" },
  { time: "20:45", title: "1라운드 결과 발표 & 2라운드" },
  { time: "21:20", title: "풍물동아리 축하 공연" },
  { time: "21:35", title: "가요제 미니게임" },
  { time: "22:05", title: "2라운드 결과 발표 & 3라운드" },
  { time: "22:20", title: "미니게임 & 최종 결과 발표" },
];

function ContestOverview({
  tab,
  onTabChange,
}: {
  tab: Tab;
  onTabChange: (tab: Tab) => void;
}) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [canScrollDown, setCanScrollDown] = useState(true);

  const handleTabChange = (nextTab: Tab) => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = 0;
    }
    setCanScrollDown(nextTab === "timetable");
    onTabChange(nextTab);
  };

  const handleScroll = () => {
    const scrollArea = scrollAreaRef.current;
    if (!scrollArea) return;

    setCanScrollDown(
      scrollArea.scrollTop + scrollArea.clientHeight < scrollArea.scrollHeight - 4,
    );
  };

  return (
    <section
      aria-label="가요제 일정과 경연"
      className="mx-auto mt-[100px] h-[392px] w-full max-w-[361px] rounded-3xl border border-[#565656] bg-[rgba(252,252,252,0.1)] px-3 pt-4 pb-5"
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
            {item === "timetable" ? "타임테이블" : "경연 목록"}
          </button>
        ))}
      </div>
      <div className="relative mt-5 h-[292px]">
        <div
          aria-label={tab === "timetable" ? "가요제 타임테이블" : "경연 목록"}
          className="h-full touch-pan-y [scrollbar-width:none] overflow-y-auto overscroll-contain [&::-webkit-scrollbar]:hidden"
          id="contest-panel"
          onScroll={handleScroll}
          ref={scrollAreaRef}
          role="tabpanel"
        >
          {tab === "timetable" ? (
            <ol className="relative ml-2 space-y-3 border-l-2 border-[#a2a2a2] pb-12 pl-[22px]">
              {timetable.map((item, index) => (
                <li className="relative" key={`${item.time}-${item.title}`}>
                  <span
                    className={`absolute top-[21px] -left-[31px] size-4 rounded-full border border-[#fcfcfc] ${index === 0 ? "bg-[#ff0080]" : "bg-[#767676]"}`}
                  />
                  <div
                    className={`flex min-h-[61px] items-center justify-between gap-2 rounded-2xl border p-4 ${index === 0 ? "border-[#ff0080] bg-[rgba(255,0,128,0.8)]" : "border-[#fcfcfc] bg-[#767676] text-[#cfcfcf]"}`}
                  >
                    <span className="text-sm font-semibold">{item.title}</span>
                    <time className="shrink-0 text-sm font-semibold">{item.time}</time>
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <p className="pt-32 text-center text-base">
              경연 목록은 연동 후 표시됩니다
            </p>
          )}
        </div>

        {tab === "timetable" && canScrollDown && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 flex h-14 flex-col items-center justify-end bg-gradient-to-t from-[#333] via-[rgba(51,51,51,0.86)] to-transparent pb-1 text-[#fcfcfc]"
          >
            <span className="text-[10px] font-medium">아래로 밀어 일정 보기</span>
            <svg
              className="mt-0.5 size-4 motion-safe:animate-bounce"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.8"
              viewBox="0 0 16 16"
            >
              <path d="m3.5 6 4.5 4 4.5-4" />
            </svg>
          </div>
        )}
      </div>
    </section>
  );
}

export default function SongContestPage() {
  const [searchParams] = useSearchParams();
  const requestedPhase = searchParams.get("phase");
  const phase: PreviewPhase =
    requestedPhase === "open" || requestedPhase === "closed"
      ? requestedPhase
      : "before";
  const [tab, setTab] = useState<Tab>("timetable");
  const [view, setView] = useState<StoryView>("list");
  const [guideOpen, setGuideOpen] = useState(false);

  const handleSubmit = async () => {
    // 화면 미리보기만 전환한다. 실제 접수 요청은 API 연동 작업에서 연결한다.
    setView("success");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const height =
    view === "form" && phase === "open"
      ? 1764
      : view === "success" && phase === "open"
        ? 1157
        : phase === "before"
          ? 1216
          : phase === "closed"
            ? 1228
            : 1352;

  return (
    <main
      className="relative mx-auto w-full max-w-[600px] bg-[#1c1c1c] px-4 text-[#fcfcfc]"
      style={{ minHeight: height }}
    >
      <ContestOverview onTabChange={setTab} tab={tab} />

      {phase === "before" && (
        <section className="mx-auto mt-40 flex w-full max-w-[361px] flex-col items-center gap-12 text-center">
          <h1 className="text-2xl font-semibold">사연 모집이 아직이에요</h1>
          <img alt="" className="h-[208px] w-[260px] object-contain" src={hourglass} />
          <p className="text-base font-medium">곧 사연 모집이 시작 됩니다!</p>
        </section>
      )}

      {phase === "closed" && (
        <section className="mx-auto mt-40 flex w-full max-w-[361px] flex-col items-center gap-12 text-center">
          <h1 className="text-2xl font-semibold">사연 모집이 끝났어요</h1>
          <img
            alt=""
            className="h-[220px] w-[248px] scale-[1.16] object-cover"
            src={lockIllustration}
          />
          <p className="text-base font-medium">축제 시작 시 신청한 사연이 낭독 돼요</p>
        </section>
      )}

      {phase === "open" && (
        <p
          className="absolute top-[516px] left-1/2 w-[calc(100%-32px)] max-w-[361px] -translate-x-1/2 rounded-lg bg-[#323232] px-3 py-2 text-center text-xs text-[#cfcfcf]"
          role="status"
        >
          화면 미리보기 · Google 로그인과 실제 접수는 연결 전입니다
        </p>
      )}

      {phase === "open" && view === "list" && (
        <section className="mx-auto mt-20 w-full max-w-[361px]">
          <h1 className="text-2xl font-bold">사연 신청 목록</h1>
          <div
            aria-label="접수된 사연 제목"
            className="mt-[84px] flex min-h-[300px] items-center justify-center text-center text-sm text-[#a2a2a2]"
          >
            사연 목록은 연동 후 표시됩니다
          </div>
          <button
            className="mt-[84px] h-14 w-full rounded-2xl bg-[#ff0080] text-base font-semibold"
            onClick={() => setGuideOpen(true)}
            type="button"
          >
            신청하기
          </button>
        </section>
      )}

      {phase === "open" && view === "form" && <StoryForm onSubmit={handleSubmit} />}

      {phase === "open" && view === "success" && (
        <section
          aria-live="polite"
          className="mx-auto mt-[120px] flex w-full max-w-[361px] flex-col items-center gap-10 text-center"
        >
          <img alt="" className="h-[261px] w-[248px] object-contain" src={letter} />
          <h1 className="text-2xl font-semibold">사연이 접수되었어요</h1>
          <p className="text-base font-medium">
            실제 접수가 아닌 완료 화면 미리보기입니다
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

      <p className="absolute bottom-10 left-0 w-full text-center text-[10px] leading-3 text-[#a2a2a2]">
        자세한 소식과 문의는 GROOVE 축제 공식 SNS에서 확인해 주세요.
      </p>

      {guideOpen && phase === "open" && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 px-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setGuideOpen(false);
          }}
        >
          <section
            aria-label="사연 신청 안내 사항"
            aria-modal="true"
            className="relative h-[467px] w-[320px] max-w-full rounded-[36px] bg-[#bbb4ae] text-[#fcfcfc] shadow-xl"
            role="dialog"
          >
            <button
              aria-label="안내 닫기"
              className="absolute top-8 right-8 size-5"
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
              className="absolute top-[52px] left-1/2 h-[83px] w-20 -translate-x-1/2 object-contain"
              src={microphone}
            />
            <h2 className="absolute top-[145px] w-full text-center text-2xl font-semibold">
              사연 신청 안내 사항
            </h2>
            <ul className="absolute top-[203px] right-7 left-14 list-disc space-y-4 text-xs leading-[15px]">
              <li>신청한 사연은 무대 진행 중 MC가 낭독하는 이벤트입니다.</li>
              <li>별명을 입력하지 않을 경우, 본명으로 사연을 소개합니다.</li>
              <li>한 계정당 하나의 사연만 등록할 수 있습니다.</li>
              <li>실제 신청에는 Google 로그인이 필요합니다.</li>
            </ul>
            <button
              className="absolute right-8 bottom-8 left-8 h-14 rounded-2xl bg-[#ff0080] text-base font-semibold"
              onClick={() => {
                setGuideOpen(false);
                setView("form");
              }}
              type="button"
            >
              작성 화면 미리보기
            </button>
          </section>
        </div>
      )}
    </main>
  );
}
