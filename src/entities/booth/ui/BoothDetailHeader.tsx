import { type BoothDetail } from "../model/boothDetail";
import { formatOperatingDate, getBoothDisplayName } from "../model/booths";
import { BoothDepartments } from "./BoothDepartments";
import { MenuBoardImage } from "./MenuBoardImage";
import { OperatingDateBadge } from "./OperatingDateBadge";

export const BoothDetailHeader = ({
  booth,
}: {
  booth: Pick<
    BoothDetail,
    | "departments"
    | "description"
    | "menuBoardImageUrl"
    | "name"
    | "operatingDate"
    | "operatingToday"
    | "spotDepartments"
  >;
}) => {
  return (
    <header className={`flex flex-col ${booth.menuBoardImageUrl ? "gap-6" : ""}`}>
      {booth.menuBoardImageUrl && (
        <MenuBoardImage
          alt={`${getBoothDisplayName(booth)} 메뉴판`}
          src={booth.menuBoardImageUrl}
        />
      )}

      <div className="flex min-w-0 flex-col gap-2">
        <div className="flex min-w-0 flex-col gap-2">
          <div className="flex min-w-0 flex-col gap-1.5">
            <BoothDepartments
              booth={booth}
              className="w-full text-lg leading-[22px] font-medium text-[#fcfcfc]"
            />
            <h1 className="text-2xl leading-[29px] font-bold break-keep text-[#fcfcfc]">
              {getBoothDisplayName(booth)}
            </h1>
          </div>
          {booth.description && (
            <p className="text-base leading-[19px] font-medium text-[#cfcfcf]">
              {booth.description}
            </p>
          )}
        </div>
        <OperatingDateBadge booth={booth} length="long" />
      </div>

      {booth.operatingToday === false && booth.operatingDate && (
        <p
          className="rounded-2xl border border-[#cfff04] bg-[rgba(207,255,4,0.08)] px-4 py-3 text-sm leading-5 font-medium text-[#cfff04]"
          role="status"
        >
          오늘은 쉬는 날이에요. 이 주막은 {formatOperatingDate(booth.operatingDate)}에
          열어요.
        </p>
      )}
    </header>
  );
};
