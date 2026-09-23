import { Link } from "react-router";

import { cardChevronIcon } from "@/shared/ui";

import {
  formatBoothDepartments,
  getBoothDisplayName,
  type Booth,
} from "../model/booths";
import { CollegeBadge } from "./CollegeBadge";

interface BoothCardProps {
  booth: Booth;
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

export const BoothCard = ({ booth, to }: BoothCardProps) => {
  const departments = formatBoothDepartments(booth.departments);
  const displayName = getBoothDisplayName(booth);

  return (
    <Link
      className="flex h-[98px] w-full items-center justify-between rounded-3xl border border-[#fcfcfc] bg-[#767676] px-6 py-5 text-[#fcfcfc]"
      data-testid="booth-card"
      to={to}
    >
      <div className="flex min-w-0 items-center gap-4">
        <BoothCollegeBadge colleges={booth.colleges} />
        <div className="min-w-0 leading-none font-semibold">
          <p className="truncate text-xl">{displayName}</p>
          {displayName !== departments && (
            <p className="mt-1 truncate text-base">{departments}</p>
          )}
        </div>
      </div>
      <img alt="" className="ml-3 h-4 w-2 shrink-0" src={cardChevronIcon} />
    </Link>
  );
};
