import { BookOpenText } from "lucide-react";
import { Link } from "react-router";

import {
  formatBoothDepartments,
  getBoothDisplayName,
  type Booth,
} from "../model/booths";
import { CollegeBadge } from "./CollegeBadge";

interface BoothCardProps {
  booth: Booth;
  onSelectLocation: () => void;
  to: string;
}

const BoothCollegeBadge = ({ colleges }: Pick<Booth, "colleges">) => {
  if (colleges.length === 1) {
    return <CollegeBadge college={colleges[0]} />;
  }

  return (
    <span aria-hidden="true" className="relative block h-[53.926px] w-14 shrink-0">
      <span className="absolute top-0 left-0">
        <CollegeBadge college={colleges[0]} size="small" />
      </span>
      <span className="absolute top-[16.593px] left-[18.667px]">
        <CollegeBadge college={colleges[1]} size="small" />
      </span>
    </span>
  );
};

export const BoothCard = ({ booth, onSelectLocation, to }: BoothCardProps) => {
  const departments = formatBoothDepartments(booth.departments);
  const displayName = getBoothDisplayName(booth);

  return (
    <div
      className="flex h-[90px] w-full items-center justify-between rounded-3xl border border-[#fcfcfc] bg-[#767676] px-6 py-5 text-[#fcfcfc] transition-transform duration-150 ease-out active:scale-[0.97] motion-reduce:transition-none"
      data-testid="booth-card"
    >
      <button
        aria-label={`${displayName} 주막 위치 보기`}
        className="flex min-w-0 flex-1 items-center gap-4 text-left"
        onClick={onSelectLocation}
        type="button"
      >
        <BoothCollegeBadge colleges={booth.colleges} />
        <div className="min-w-0 leading-none font-semibold">
          <p className="truncate text-xl">{displayName}</p>
          {displayName !== departments && (
            <p className="mt-[3px] truncate text-sm font-medium">{departments}</p>
          )}
        </div>
      </button>
      <Link
        aria-label={`${displayName} 메뉴 보기`}
        className="ml-3 flex h-12 w-[74px] shrink-0 items-center justify-center gap-1 rounded-2xl border border-[rgba(252,252,252,0.7)] text-xs font-semibold transition-[background-color,transform] duration-150 hover:bg-[rgba(252,252,252,0.12)] active:scale-95 motion-reduce:transition-none"
        to={to}
      >
        <BookOpenText aria-hidden="true" className="size-[18px]" strokeWidth={2.2} />
        메뉴
      </Link>
    </div>
  );
};
