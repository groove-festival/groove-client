import { Link } from "react-router";

import { navItems } from "../model/navItems";

interface FestivalMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FestivalMenu = ({ isOpen, onClose }: FestivalMenuProps) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      aria-label="전체 메뉴"
      aria-modal="true"
      className="fixed inset-0 z-[60] flex justify-center bg-black/40"
      role="dialog"
    >
      <div className="relative h-full w-full max-w-[600px] overflow-y-auto bg-[#1c1c1c]">
        <div className="flex h-20 shrink-0 items-center px-4">
          <button
            aria-label="메뉴 닫기"
            className="flex size-8 items-center justify-center text-[#fcfcfc]"
            onClick={onClose}
            type="button"
          >
            <svg
              aria-hidden="true"
              className="size-6"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.8"
              viewBox="0 0 24 24"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav aria-label="사이트 메뉴" className="-mt-2 px-4">
          <ul>
            {navItems.map((item) => (
              <li className="border-b border-[#3a3a3a]" key={item.label}>
                <Link
                  className="flex h-[94px] items-center pl-6 text-2xl font-medium text-[#fcfcfc]"
                  onClick={onClose}
                  to={item.to}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
};
