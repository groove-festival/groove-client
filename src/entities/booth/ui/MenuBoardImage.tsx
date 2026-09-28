import { ChevronDown } from "lucide-react";
import { useState } from "react";

// 세로 길이가 가로의 이 배수를 넘으면 여러 장을 이어 붙인 메뉴판이다.
const TALL_BOARD_RATIO = 1.6;

interface MenuBoardImageProps {
  alt: string;
  src: string;
}

// 메뉴판은 가격을 읽는 사진이라 잘리면 안 된다. 원래 비율대로 전부 보여준다.
// 학과 여러 곳의 메뉴판을 세로로 이어 붙인 주막은 한 장이 화면 몇 개 길이라
// 메뉴 목록이 한참 아래로 밀린다. 그런 사진만 윗부분을 보여주고 "전체 보기"로
// 펼친다. 몰래 자르지 않고 접혀 있다는 것을 버튼으로 드러낸다.
export const MenuBoardImage = ({ alt, src }: MenuBoardImageProps) => {
  const [heightRatio, setHeightRatio] = useState<number | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const isTall = heightRatio !== null && heightRatio > TALL_BOARD_RATIO;
  const isFolded = isTall && !isExpanded;

  return (
    <div className="flex flex-col gap-2">
      <div className="relative overflow-hidden rounded-3xl">
        <img
          alt={alt}
          className={`block w-full ${isFolded ? "aspect-[3/4] object-cover object-top" : "h-auto"}`}
          onLoad={(event) => {
            const { naturalHeight, naturalWidth } = event.currentTarget;

            if (naturalWidth > 0) {
              setHeightRatio(naturalHeight / naturalWidth);
            }
          }}
          src={src}
        />
        {isFolded && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#1c1c1c] to-transparent"
          />
        )}
      </div>
      {isTall && (
        <button
          aria-expanded={isExpanded}
          className="flex h-11 items-center justify-center gap-1 rounded-2xl border border-[#767676] text-sm font-semibold text-[#fcfcfc]"
          onClick={() => setIsExpanded((expanded) => !expanded)}
          type="button"
        >
          {isExpanded ? "메뉴판 접기" : "메뉴판 전체 보기"}
          <ChevronDown
            aria-hidden="true"
            className={isExpanded ? "rotate-180" : ""}
            size={18}
          />
        </button>
      )}
    </div>
  );
};
