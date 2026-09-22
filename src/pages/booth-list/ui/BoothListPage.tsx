import { useMemo, useState } from "react";

import {
  BoothCard,
  boothFilterOptions,
  getBoothsByFilter,
  type BoothFilter,
  useBooths,
} from "@/entities/booth";
import { LoadingFallback, NetworkErrorFallback } from "@/shared/ui";

import boothMap from "../festival-visuals/booth-map.png";
import filterChevron from "../festival-visuals/filter-chevron.svg";
import { BoothNoticeDialog } from "./BoothNoticeDialog";

const NOTICE_DISMISSED_STORAGE_KEY = "groove:booth-notice-dismissed";

const mapZoneLabels = ["전체", "학생주차장", "복지관"];

const hasDismissedNotice = () => {
  try {
    return window.localStorage.getItem(NOTICE_DISMISSED_STORAGE_KEY) === "true";
  } catch {
    return false;
  }
};

const BoothMapPreview = () => {
  return (
    <section aria-label="주막 지도" className="flex w-full flex-col gap-3">
      <div className="grid h-[59px] grid-cols-3 gap-2 rounded-full border border-[#767676] bg-[rgba(252,252,252,0.1)] p-2">
        {mapZoneLabels.map((label, index) => (
          <span
            aria-current={index === 0 ? "true" : undefined}
            className={`flex items-center justify-center rounded-full px-5 text-base font-semibold whitespace-nowrap ${
              index === 0 ? "bg-[rgba(207,255,4,0.8)] text-[#1c1c1c]" : "text-[#767676]"
            }`}
            key={label}
          >
            {label}
          </span>
        ))}
      </div>
      <img
        alt="학생주차장과 복지관의 주막 위치 지도"
        className="aspect-[361/448] w-full rounded-3xl object-cover"
        src={boothMap}
      />
    </section>
  );
};

const BoothFilterMenu = ({
  onChange,
  selectedFilter,
}: {
  onChange: (filter: BoothFilter) => void;
  selectedFilter: BoothFilter;
}) => {
  const [isOpen, setIsOpen] = useState(false);
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
          className="absolute top-9 left-0 flex w-[111px] flex-col items-center justify-center rounded-xl bg-[rgba(252,252,252,0.4)] px-4 py-3 text-base font-medium text-[#fcfcfc] backdrop-blur-[24px]"
          role="listbox"
        >
          {boothFilterOptions.map((option) => (
            <button
              aria-selected={selectedFilter === option.id}
              className="flex h-[43px] w-max items-center px-4 whitespace-nowrap"
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
  const [isNoticeOpen, setIsNoticeOpen] = useState(() => !hasDismissedNotice());
  const boothsQuery = useBooths();
  const filteredBooths = useMemo(
    () => getBoothsByFilter(boothsQuery.data ?? [], selectedFilter),
    [boothsQuery.data, selectedFilter],
  );

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

  return (
    <main className="relative min-h-dvh bg-[#1c1c1c] px-4 pt-[100px] text-[#fcfcfc]">
      <BoothMapPreview />

      <div className="mt-4">
        <BoothFilterMenu onChange={setSelectedFilter} selectedFilter={selectedFilter} />
      </div>

      <ul
        aria-label={`${boothFilterOptions.find(({ id }) => id === selectedFilter)?.label} 주막 목록`}
        className="mt-4 flex flex-col gap-4"
      >
        {filteredBooths.length === 0 && (
          <li className="py-10 text-center text-sm text-[#a2a2a2]">
            등록된 주막이 아직 없어요.
          </li>
        )}
        {filteredBooths.map((booth) => (
          <li key={booth.boothCode}>
            <BoothCard booth={booth} to={`/pub/${booth.boothCode}`} />
          </li>
        ))}
      </ul>

      <p
        className={`${selectedFilter === "NURSING" ? "mt-[164px]" : "mt-40"} pb-[74px] text-center text-[10px] leading-3 text-[#a2a2a2]`}
      >
        자세한 소식과 문의는 GROOVE 축제 공식 SNS에서 확인해 주세요.
      </p>

      {isNoticeOpen && (
        <BoothNoticeDialog
          onClose={() => setIsNoticeOpen(false)}
          onDismissPermanently={dismissNoticePermanently}
        />
      )}
    </main>
  );
};

export default BoothListPage;
