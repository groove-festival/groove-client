import { type Booth, formatOperatingDate } from "../model/booths";

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
