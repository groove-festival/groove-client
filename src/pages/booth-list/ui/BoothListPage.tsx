import { useEffect, useMemo, useRef, useState } from "react";
import { X } from "lucide-react";

import {
  BoothCard,
  boothFilterOptions,
  getBoothDisplayName,
  getBoothsByFilter,
  type BoothFilter,
  useBooths,
} from "@/entities/booth";
import { LoadingFallback, NetworkErrorFallback } from "@/shared/ui";

import { getBoothsByArea, type PubMapArea } from "../model/pubMap";

import filterChevron from "../festival-visuals/filter-chevron.svg";
import { BoothNoticeDialog } from "./BoothNoticeDialog";
import { PubBoothMap } from "./PubBoothMap";

// 펼친 단대 목록과 화면 아래 끝 사이에 남길 여백.
const MENU_BOTTOM_MARGIN_PX = 16;

const NOTICE_DISMISSED_STORAGE_KEY = "groove:booth-notice-dismissed";
// 확인한 안내는 같은 탭에서 다시 띄우지 않는다. 상세에서 뒤로 돌아올 때마다
// 목록이 새로 마운트되며 안내가 다시 뜨는 것을 막는다.
const NOTICE_CONFIRMED_SESSION_KEY = "groove:booth-notice-confirmed";

const hasDismissedNotice = () => {
  try {
    return (
      window.localStorage.getItem(NOTICE_DISMISSED_STORAGE_KEY) === "true" ||
      window.sessionStorage.getItem(NOTICE_CONFIRMED_SESSION_KEY) === "true"
    );
  } catch {
    return false;
  }
};

const BoothFilterMenu = ({
  onChange,
  selectedFilter,
}: {
  onChange: (filter: BoothFilter) => void;
  selectedFilter: BoothFilter;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // 펼친 목록이 화면 아래로 잘리면 잘린 만큼만 내려 준다. 화면 안에 다 들어와
  // 있으면 움직이지 않는다.
  useEffect(() => {
    if (!isOpen) return;

    const menu = menuRef.current;
    if (!menu) return;

    const hiddenBelow =
      menu.getBoundingClientRect().bottom + MENU_BOTTOM_MARGIN_PX - window.innerHeight;
    if (hiddenBelow <= 0) return;

    const prefersReducedMotion = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    window.scrollBy({
      behavior: prefersReducedMotion ? "auto" : "smooth",
      top: hiddenBelow,
    });
  }, [isOpen]);
  const selectedLabel = boothFilterOptions.find(
    ({ id }) => id === selectedFilter,
  )?.label;

  return (
    <div className="relative z-20 w-fit">
      <button
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        className="flex h-[37px] items-center gap-2 rounded-full border border-[#fcfcfc] bg-[#767676] px-4 text-base font-medium text-[#fcfcfc]"
        onClick={() => setIsOpen((previous) => !previous)}
        type="button"
      >
        {selectedLabel}
        <img alt="" className="h-[7.175px] w-[13.414px]" src={filterChevron} />
      </button>

      {isOpen && (
        <div
          aria-label="단과대 필터"
          ref={menuRef}
          // 버튼(37px) 바로 아래 한 픽셀부터 이어 붙인다.
          className="absolute top-[38px] left-0 flex w-[111px] flex-col items-center justify-center rounded-xl bg-[rgba(252,252,252,0.4)] px-4 py-2 text-base font-medium text-[#fcfcfc] backdrop-blur-[24px]"
          role="listbox"
        >
          {boothFilterOptions.map((option) => (
            <button
              aria-selected={selectedFilter === option.id}
              className={`flex h-9 w-max items-center px-4 whitespace-nowrap ${
                selectedFilter === option.id ? "text-[#cfff04]" : ""
              }`}
              key={option.id}
              onClick={() => {
                onChange(option.id);
                setIsOpen(false);
              }}
              role="option"
              type="button"
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const BoothListPage = () => {
  const [selectedFilter, setSelectedFilter] = useState<BoothFilter>("all");
  const [selectedArea, setSelectedArea] = useState<PubMapArea>("all");
  // 지도에서 고른 주막. 구역·단대 필터 위에 한 주막만 남기는 추가 필터다.
  const [selectedBoothCode, setSelectedBoothCode] = useState<string | null>(null);
  const [isNoticeOpen, setIsNoticeOpen] = useState(() => !hasDismissedNotice());
  const boothsQuery = useBooths();
  const booths = useMemo(() => boothsQuery.data ?? [], [boothsQuery.data]);
  // 구역과 단대를 모두 통과한 기본 목록. 주막 한 곳을 고르기 전과 선택을
  // 해제한 뒤에는 이 목록을 그대로 보여준다.
  const baseFilteredBooths = useMemo(
    () => getBoothsByArea(getBoothsByFilter(booths, selectedFilter), selectedArea),
    [booths, selectedArea, selectedFilter],
  );
  const selectedBooth = useMemo(
    () =>
      selectedBoothCode === null
        ? null
        : (baseFilteredBooths.find(
            ({ boothCode }) => boothCode === selectedBoothCode,
          ) ?? null),
    [baseFilteredBooths, selectedBoothCode],
  );
  const filteredBooths = useMemo(
    () => (selectedBooth ? [selectedBooth] : baseFilteredBooths),
    [baseFilteredBooths, selectedBooth],
  );
  const selectableCodes = useMemo(
    () => new Set(baseFilteredBooths.map(({ boothCode }) => boothCode)),
    [baseFilteredBooths],
  );
  const highlightedCodes = useMemo(
    () => new Set(filteredBooths.map(({ boothCode }) => boothCode)),
    [filteredBooths],
  );

  // 필터를 바꾸면 고른 주막이 목록에서 사라질 수 있어 선택을 함께 푼다.
  const changeFilter = (filter: BoothFilter) => {
    setSelectedFilter(filter);
    setSelectedBoothCode(null);
  };

  const changeArea = (area: PubMapArea) => {
    setSelectedArea(area);
    setSelectedBoothCode(null);
  };

  if (boothsQuery.isPending) {
    return <LoadingFallback />;
  }

  if (boothsQuery.isError) {
    return <NetworkErrorFallback onReload={() => void boothsQuery.refetch()} />;
  }

  const dismissNoticePermanently = () => {
    try {
      window.localStorage.setItem(NOTICE_DISMISSED_STORAGE_KEY, "true");
    } catch {
      // Storage can be unavailable in private or restricted browsing contexts.
    }
    setIsNoticeOpen(false);
  };

  const confirmNotice = () => {
    try {
      window.sessionStorage.setItem(NOTICE_CONFIRMED_SESSION_KEY, "true");
    } catch {
      // Storage can be unavailable in private or restricted browsing contexts.
    }
    setIsNoticeOpen(false);
  };

  return (
    <main className="relative min-h-dvh bg-[#1c1c1c] px-4 pt-[100px] text-[#fcfcfc]">
      <PubBoothMap
        booths={booths}
        highlightedCodes={highlightedCodes}
        onSelectArea={changeArea}
        onSelectBooth={setSelectedBoothCode}
        selectableCodes={selectableCodes}
        selectedArea={selectedArea}
      />

      <div className="mt-4 flex min-w-0 items-center gap-2">
        <BoothFilterMenu onChange={changeFilter} selectedFilter={selectedFilter} />
        {selectedBooth && (
          <div
            className="animate-booth-filter-chip-in flex h-[37px] min-w-0 items-center gap-1 rounded-full border border-[#cfff04] bg-[rgba(207,255,4,0.12)] py-1 pr-1 pl-4 text-sm font-medium text-[#cfff04] motion-reduce:animate-none"
            key={selectedBooth.boothCode}
          >
            <span className="truncate">{getBoothDisplayName(selectedBooth)}</span>
            <button
              aria-label={`${getBoothDisplayName(selectedBooth)} 주막 필터 해제`}
              className="flex size-7 shrink-0 items-center justify-center rounded-full transition-[background-color,transform] duration-150 hover:bg-[rgba(207,255,4,0.14)] active:scale-90 active:bg-[rgba(207,255,4,0.24)] motion-reduce:transition-none"
              onClick={() => setSelectedBoothCode(null)}
              type="button"
            >
              <X aria-hidden="true" className="size-4" strokeWidth={2.25} />
            </button>
          </div>
        )}
      </div>

      <ul
        aria-label={`${boothFilterOptions.find(({ id }) => id === selectedFilter)?.label} 주막 목록`}
        // 펼친 단대 드롭다운(버튼 아래 342px)보다 목록이 짧아도 푸터가 그 위로
        // 올라오지 않도록 최소 높이를 준다. 카드가 많으면 영향이 없다.
        className="mt-4 flex min-h-[300px] flex-col gap-4 pb-6"
      >
        {filteredBooths.length === 0 && (
          <li className="py-10 text-center text-sm text-[#a2a2a2]">
            등록된 주막이 아직 없어요.
          </li>
        )}
        {filteredBooths.map((booth) => (
          <li
            className={
              selectedBooth
                ? "animate-booth-filter-result-in motion-reduce:animate-none"
                : ""
            }
            key={booth.boothCode}
          >
            <BoothCard
              booth={booth}
              isSelected={booth.boothCode === selectedBoothCode}
              to={`/pub/${booth.boothCode}`}
            />
          </li>
        ))}
      </ul>

      {isNoticeOpen && (
        <BoothNoticeDialog
          onClose={confirmNotice}
          onDismissPermanently={dismissNoticePermanently}
        />
      )}
    </main>
  );
};

export default BoothListPage;
