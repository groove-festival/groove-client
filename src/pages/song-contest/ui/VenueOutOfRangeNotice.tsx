interface VenueOutOfRangeNoticeProps {
  onRetry: () => void;
}

export function VenueOutOfRangeNotice({ onRetry }: VenueOutOfRangeNoticeProps) {
  return (
    <div className="flex w-[251px] flex-col items-center gap-10 text-center">
      <span
        aria-hidden="true"
        className="flex size-[120px] items-center justify-center rounded-full bg-[#ff0080]/20"
      >
        <span className="size-16 rounded-full bg-[#ff0080]" />
      </span>
      <p className="text-base font-medium text-[#fcfcfc]">
        무대 주변으로 이동하면 투표가 가능해요
      </p>
      <button
        className="text-sm font-medium text-[#a2a2a2] underline"
        onClick={onRetry}
        type="button"
      >
        위치 다시 확인
      </button>
    </div>
  );
}
