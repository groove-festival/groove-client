import { type Booth, formatOperatingDate } from "../model/booths";

// 날짜별로 여는 주막의 운영일. 목록 카드는 다른 주막과 같게 두고 상세 헤더에서만
// 운영일을 보인다. 이틀 다 여는 주막에는 그리지 않는다.
export const OperatingDateBadge = ({
  booth,
  length = "short",
}: {
  booth: Pick<Booth, "operatingDate">;
  length?: "long" | "short";
}) => {
  if (!booth.operatingDate) return null;

  return (
    <span
      className="inline-flex h-6 shrink-0 items-center self-start rounded-full border border-[#cfff04] px-2 text-xs leading-none font-semibold whitespace-nowrap text-[#cfff04]"
      data-testid="operating-date-badge"
    >
      {formatOperatingDate(booth.operatingDate, length)}
      {length === "long" && " 운영"}
    </span>
  );
};
