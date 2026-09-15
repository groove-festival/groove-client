import { Link } from "react-router";

import { navItems } from "../model/navItems";

interface FestivalMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FestivalMenu = ({ isOpen, onClose }: FestivalMenuProps) => {
  return (
    <div
      aria-hidden={!isOpen}
      aria-label="전체 메뉴"
      aria-modal={isOpen ? "true" : undefined}
      className={`fixed top-0 left-1/2 z-[60] h-dvh w-full max-w-[600px] -translate-x-1/2 overflow-hidden ${
        isOpen ? "" : "pointer-events-none"
      }`}
      role="dialog"
    >
      <div
        className={`h-full w-full overflow-y-auto bg-[#1c1c1c] transition-transform duration-300 ease-out will-change-transform motion-reduce:transition-none ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-20 shrink-0 items-center px-4">
          <button
            aria-label="메뉴 닫기"
            className="flex size-8 items-center justify-center text-[#fcfcfc]"
            onClick={onClose}
            tabIndex={isOpen ? undefined : -1}
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
              <li
                className="border-b border-[#3a3a3a] last:border-b-0"
                key={item.label}
              >
                <Link
                  className="flex h-[94px] items-center pl-6 text-2xl font-medium text-[#fcfcfc]"
                  onClick={onClose}
                  tabIndex={isOpen ? undefined : -1}
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
