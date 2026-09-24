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
  // 고른 카드는 흰 테두리 대신 네온 테두리로 바꾼다. 흰 선을 두고 그 바깥에
  // 네온을 덧그리면 선이 두 겹으로 보인다.
  isSelected?: boolean;
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

export const BoothCard = ({ booth, isSelected = false, to }: BoothCardProps) => {
  const departments = formatBoothDepartments(booth.departments);
  const displayName = getBoothDisplayName(booth);

  return (
    <Link
      className={`flex h-[98px] w-full items-center justify-between rounded-3xl bg-[#767676] px-6 py-5 text-[#fcfcfc] transition-transform duration-150 ease-out active:scale-[0.97] motion-reduce:transition-none ${
        isSelected ? "border-2 border-[#cfff04]" : "border border-[#fcfcfc]"
      }`}
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
      {/* 화살표도 선택 색을 따라가야 해서 이미지를 그대로 쓰지 않고 모양만 떠서 칠한다. */}
      <span
        aria-hidden="true"
        className={`ml-3 h-4 w-2 shrink-0 ${
          isSelected
            ? "animate-arrow-nudge bg-[#cfff04] motion-reduce:animate-none"
            : "bg-[#fcfcfc]"
        }`}
        style={{
          maskImage: `url("${cardChevronIcon}")`,
          maskPosition: "center",
          maskRepeat: "no-repeat",
          maskSize: "contain",
          WebkitMaskImage: `url("${cardChevronIcon}")`,
          WebkitMaskPosition: "center",
          WebkitMaskRepeat: "no-repeat",
          WebkitMaskSize: "contain",
        }}
      />
    </Link>
  );
};
