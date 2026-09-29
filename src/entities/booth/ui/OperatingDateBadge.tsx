import { type Booth, formatOperatingDate } from "../model/booths";

// 날짜별로 여는 주막의 운영일. 축제 전에는 같은 자리의 두 학과가 나란히 보이므로
// 어느 날 여는지를 카드마다 붙인다. 이틀 다 여는 주막에는 그리지 않는다.
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
