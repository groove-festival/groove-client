import { type PubAdminView, pubAdminViews } from "../model/pubAdminView";

interface PubAdminTabBarProps {
  activeView: PubAdminView;
  badgeCounts: Partial<Record<PubAdminView, number>>;
  onSelect: (view: PubAdminView) => void;
}

export const PubAdminTabBar = ({
  activeView,
  badgeCounts,
  onSelect,
}: PubAdminTabBarProps) => (
  <nav className="fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-[600px] border-t border-[#3a3a3a] bg-[rgba(28,28,28,0.96)] pb-[env(safe-area-inset-bottom)] backdrop-blur-[12px]">
    <div aria-label="주막 관리 화면" className="grid h-16 grid-cols-5" role="tablist">
      {pubAdminViews.map(({ icon: Icon, id, label }) => {
        const count = badgeCounts[id] ?? 0;
        const isActive = activeView === id;

        return (
          <button
            aria-controls={`pub-admin-${id}`}
            aria-selected={isActive}
            className={`relative flex flex-col items-center justify-center gap-1 text-[11px] font-semibold ${
              isActive ? "text-[#fcfcfc]" : "text-[#7a7a7a]"
            }`}
            id={`pub-admin-${id}-tab`}
            key={id}
            onClick={() => onSelect(id)}
            role="tab"
            type="button"
          >
            {isActive && (
              <span
                aria-hidden="true"
                className="absolute top-0 h-0.5 w-10 rounded-full bg-[#5d00ff]"
              />
            )}
            <span className="relative">
              <Icon aria-hidden="true" size={22} strokeWidth={isActive ? 2.2 : 1.8} />
              {count > 0 && (
                <span className="absolute -top-1.5 -right-3 min-w-[18px] rounded-full bg-[#00ffff] px-1 text-center text-[10px] leading-[18px] font-bold text-[#0b0b0b] tabular-nums">
                  {count > 99 ? "99+" : count}
                  <span className="sr-only">건</span>
                </span>
              )}
            </span>
            {label}
          </button>
        );
      })}
    </div>
  </nav>
);
