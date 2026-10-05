import { ChevronDown } from "lucide-react";
import { useState } from "react";

const TALL_BOARD_RATIO = 1.6;

interface MenuBoardImageProps {
  alt: string;
  src: string;
}

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
