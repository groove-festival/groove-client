import { useEffect, useMemo, useRef, useState } from "react";
import { X } from "lucide-react";

import {
  BoothCard,
  boothFilterOptions,
  compareByOperatingDay,
  getBoothDisplayName,
  getBoothSpotCode,
  getBoothsByFilter,
  type BoothFilter,
  useBooths,
} from "@/entities/booth";
import { LoadingFallback, NetworkErrorFallback } from "@/shared/ui";
import { readStorageItem, writeStorageItem } from "@/shared/lib/storage";

import { getBoothsByArea, type PubMapArea } from "../model/pubMap";

import filterChevron from "../festival-visuals/filter-chevron.svg";
import { BoothNoticeDialog } from "./BoothNoticeDialog";
import { PubBoothMap } from "./PubBoothMap";

const MENU_BOTTOM_MARGIN_PX = 16;

const SELECTED_BOOTH_BOTTOM_MARGIN_PX = 24;

const NOTICE_DISMISSED_STORAGE_KEY = "groove:booth-notice-dismissed";

const NOTICE_CONFIRMED_SESSION_KEY = "groove:booth-notice-confirmed";

const hasDismissedNotice = () =>
  readStorageItem("local", NOTICE_DISMISSED_STORAGE_KEY) === "true" ||
  readStorageItem("session", NOTICE_CONFIRMED_SESSION_KEY) === "true";

const BoothFilterMenu = ({
  onChange,
  selectedFilter,
}: {
  onChange: (filter: BoothFilter) => void;
  selectedFilter: BoothFilter;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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

  const [selectedSpotCode, setSelectedSpotCode] = useState<string | null>(null);
  const [isNoticeOpen, setIsNoticeOpen] = useState(() => !hasDismissedNotice());
  const pubMapRef = useRef<HTMLDivElement>(null);
  const selectedBoothResultRef = useRef<HTMLLIElement>(null);
  const boothsQuery = useBooths();
  const booths = useMemo(() => boothsQuery.data ?? [], [boothsQuery.data]);

  const baseFilteredBooths = useMemo(
    () => getBoothsByArea(getBoothsByFilter(booths, selectedFilter), selectedArea),
    [booths, selectedArea, selectedFilter],
  );
  const selectedBooths = useMemo(
    () =>
      selectedSpotCode === null
        ? []
        : baseFilteredBooths
            .filter((booth) => getBoothSpotCode(booth) === selectedSpotCode)
            .sort(compareByOperatingDay),
    [baseFilteredBooths, selectedSpotCode],
  );
  const filteredBooths = useMemo(
    () => (selectedBooths.length > 0 ? selectedBooths : baseFilteredBooths),
    [baseFilteredBooths, selectedBooths],
  );
  const selectableCodes = useMemo(
    () => new Set(baseFilteredBooths.map(getBoothSpotCode)),
    [baseFilteredBooths],
  );
  const highlightedCodes = useMemo(
    () => new Set(filteredBooths.map(getBoothSpotCode)),
    [filteredBooths],
  );
  const selectedLabel = selectedBooths.map(getBoothDisplayName).join(" · ");

  const changeFilter = (filter: BoothFilter) => {
    setSelectedFilter(filter);
    setSelectedSpotCode(null);
  };

  const changeArea = (area: PubMapArea) => {
    setSelectedArea(area);
    setSelectedSpotCode(null);
  };

  const scrollToSelectedBoothResult = () => {
    const target = selectedBoothResultRef.current;
    if (!target) return;

    const hiddenBelow =
      target.getBoundingClientRect().bottom +
      SELECTED_BOOTH_BOTTOM_MARGIN_PX -
      window.innerHeight;
    if (hiddenBelow <= 0) return;

    const prefersReducedMotion = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    window.scrollBy({
      behavior: prefersReducedMotion ? "auto" : "smooth",
      top: hiddenBelow,
    });
  };

  const selectSpot = (spotCode: string) => {
    setSelectedSpotCode(spotCode);
  };

  const selectSpotFromMap = (spotCode: string) => {
    selectSpot(spotCode);
    window.setTimeout(scrollToSelectedBoothResult, 0);
  };

  const scrollToPubMap = () => {
    const prefersReducedMotion = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    pubMapRef.current?.scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",
      block: "start",
    });
  };

  const selectSpotFromCard = (spotCode: string) => {
    selectSpot(spotCode);
    window.setTimeout(scrollToPubMap, 0);
  };

  if (boothsQuery.isPending) {
    return <LoadingFallback />;
  }

  if (boothsQuery.isError) {
    return <NetworkErrorFallback onReload={() => void boothsQuery.refetch()} />;
  }

  const dismissNoticePermanently = () => {
    writeStorageItem("local", NOTICE_DISMISSED_STORAGE_KEY, "true");
    setIsNoticeOpen(false);
  };

  const confirmNotice = () => {
    writeStorageItem("session", NOTICE_CONFIRMED_SESSION_KEY, "true");
    setIsNoticeOpen(false);
  };

  return (
    <main className="relative min-h-dvh bg-[#1c1c1c] px-4 pt-[100px] text-[#fcfcfc]">
      <div ref={pubMapRef}>
        <PubBoothMap
          booths={booths}
          highlightedCodes={highlightedCodes}
          onSelectArea={changeArea}
          onSelectSpot={selectSpotFromMap}
          selectableCodes={selectableCodes}
          selectedArea={selectedArea}
          selectedSpotCode={selectedSpotCode}
        />
      </div>

      <div className="mt-4 flex min-w-0 items-center gap-2">
        <BoothFilterMenu onChange={changeFilter} selectedFilter={selectedFilter} />
        {selectedBooths.length > 0 && (
          <div
            className="animate-booth-filter-chip-in flex h-[37px] min-w-0 items-center gap-1 rounded-full border border-[#cfff04] bg-[rgba(207,255,4,0.12)] py-1 pr-1 pl-4 text-sm font-medium text-[#cfff04] motion-reduce:animate-none"
            key={selectedSpotCode}
          >
            <span className="truncate">{selectedLabel}</span>
            <button
              aria-label={`${selectedLabel} 주막 필터 해제`}
              className="flex size-7 shrink-0 items-center justify-center rounded-full transition-[background-color,transform] duration-150 hover:bg-[rgba(207,255,4,0.14)] active:scale-90 active:bg-[rgba(207,255,4,0.24)] motion-reduce:transition-none"
              onClick={() => setSelectedSpotCode(null)}
              type="button"
            >
              <X aria-hidden="true" className="size-4" strokeWidth={2.25} />
            </button>
          </div>
        )}
      </div>

      <ul
        aria-label={`${boothFilterOptions.find(({ id }) => id === selectedFilter)?.label} 주막 목록`}

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
              selectedBooths.length > 0
                ? "animate-booth-filter-result-in motion-reduce:animate-none"
                : ""
            }
            key={booth.boothCode}

            ref={booth === selectedBooths.at(-1) ? selectedBoothResultRef : null}
          >
            <BoothCard
              booth={booth}
              onSelectLocation={() => selectSpotFromCard(getBoothSpotCode(booth))}
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
