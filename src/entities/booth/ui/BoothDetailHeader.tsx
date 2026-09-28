import { type BoothDetail } from "../model/boothDetail";
import { formatBoothDepartments, getBoothDisplayName } from "../model/booths";
import { MenuBoardImage } from "./MenuBoardImage";

export const BoothDetailHeader = ({
  booth,
}: {
  booth: Pick<
    BoothDetail,
    "departments" | "description" | "menuBoardImageUrl" | "name"
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

      <div className="flex items-start justify-between gap-6">
        <div className="flex min-w-0 flex-col gap-2">
          <h1 className="text-2xl leading-[29px] font-bold break-keep text-[#fcfcfc]">
            {getBoothDisplayName(booth)}
          </h1>
          {booth.description && (
            <p className="text-base leading-[19px] font-medium text-[#cfcfcf]">
              {booth.description}
            </p>
          )}
        </div>
        <p className="shrink-0 text-xl leading-6 text-[#cfcfcf]">
          {formatBoothDepartments(booth.departments)}
        </p>
      </div>
    </header>
  );
};
