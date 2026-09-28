import { useSearchParams } from "react-router";

import { useAdminOrders } from "../api/getAdminOrders";
import { useAdminPub } from "../api/getAdminPub";
import { partitionAdminOrders } from "../model/adminOrder";
import { AdminHeader } from "./AdminHeader";
import { PubAccountForm } from "./PubAccountForm";
import { PubKitchenBoard } from "./PubKitchenBoard";
import { PubMenuBoardImageField } from "./PubMenuBoardImageField";
import { PubMenuManager } from "./PubMenuManager";
import { PubOrderHistory } from "./PubOrderHistory";
import { PubPaymentBoard } from "./PubPaymentBoard";
import { PubStatusToggle } from "./PubStatusToggle";
import { PubTableManager } from "./PubTableManager";

type PubAdminView = "payment" | "kitchen" | "history" | "settings";

const views: { id: PubAdminView; label: string }[] = [
  { id: "payment", label: "입금 확인" },
  { id: "kitchen", label: "주방" },
  { id: "history", label: "주문 내역" },
  { id: "settings", label: "주막 설정" },
];

const VIEW_PARAM = "view";

const toView = (value: string | null): PubAdminView =>
  views.find((view) => view.id === value)?.id ?? "payment";

// 주막은 입금 확인하는 사람과 조리하는 사람이 다른 기기로 같은 계정을 쓴다.
// 화면을 탭으로 가르고 주소(?view=kitchen)에 남겨, 주방 기기는 그 주소를 열어
// 두기만 하면 된다. 메뉴·테이블처럼 축제 전에 한 번 세팅하는 것은 설정 탭으로
// 뺀다.
export const PubAdminDashboard = () => {
  const pub = useAdminPub();
  const orders = useAdminOrders();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeView = toView(searchParams.get(VIEW_PARAM));

  // 탭에 처리할 건수를 붙여 다른 탭에 있어도 새 주문이 들어온 것을 안다.
  const board = partitionAdminOrders(orders.data ?? [], orders.dataUpdatedAt);
  const badgeCounts: Partial<Record<PubAdminView, number>> = {
    payment: board.depositClaimed.length + board.pendingDeposit.length,
    kitchen: board.paid.length,
  };

  const selectView = (view: PubAdminView) => {
    setSearchParams(
      (params) => {
        const next = new URLSearchParams(params);
        next.set(VIEW_PARAM, view);
        return next;
      },
      { replace: true },
    );
  };

  return (
    <div className="flex flex-col gap-4 px-4 pt-20 pb-6">
      <AdminHeader title={pub.data?.booth.name ?? "주막 관리자"} />

      {pub.isPending && (
        <p className="text-sm text-[#a2a2a2]">주막 정보를 불러오는 중…</p>
      )}

      {pub.isError && (
        <div className="flex flex-col items-start gap-3">
          <p className="text-sm text-[#a2a2a2]">주막 정보를 불러오지 못했어요.</p>
          <button
            className="h-10 rounded-xl bg-[#3a3a3a] px-4 text-sm font-semibold"
            onClick={() => void pub.refetch()}
            type="button"
          >
            다시 시도
          </button>
        </div>
      )}

      {pub.data && (
        <>
          <div
            aria-label="주막 관리 화면"
            className="grid grid-cols-4 gap-1 rounded-2xl bg-[#262626] p-1.5"
            role="tablist"
          >
            {views.map((view) => {
              const count = badgeCounts[view.id] ?? 0;
              const isActive = activeView === view.id;

              return (
                <button
                  aria-controls={`pub-admin-${view.id}`}
                  aria-selected={isActive}
                  className={`flex h-11 items-center justify-center gap-1 rounded-xl text-xs font-semibold transition-colors ${
                    isActive ? "bg-[#5d00ff] text-[#fcfcfc]" : "text-[#a2a2a2]"
                  }`}
                  id={`pub-admin-${view.id}-tab`}
                  key={view.id}
                  onClick={() => selectView(view.id)}
                  role="tab"
                  type="button"
                >
                  {view.label}
                  {count > 0 && (
                    <span className="min-w-5 rounded-full bg-[#00ffff] px-1.5 text-[10px] leading-5 font-bold text-[#0b0b0b]">
                      {count}
                      <span className="sr-only">건</span>
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <section
            aria-labelledby={`pub-admin-${activeView}-tab`}
            className="flex flex-col gap-4"
            id={`pub-admin-${activeView}`}
            role="tabpanel"
          >
            {activeView === "payment" && <PubPaymentBoard />}
            {activeView === "kitchen" && <PubKitchenBoard />}
            {activeView === "history" && (
              <PubOrderHistory pubName={pub.data.booth.name} />
            )}
            {activeView === "settings" && (
              <>
                <PubStatusToggle
                  hasAccount={pub.data.account !== null}
                  status={pub.data.booth.status}
                />
                <PubAccountForm account={pub.data.account} />
                <PubMenuManager menus={pub.data.menus} />
                <PubMenuBoardImageField
                  menuBoardImageUrl={pub.data.menuBoardImageUrl}
                />
                <PubTableManager boothCode={pub.data.booth.boothCode} />
              </>
            )}
          </section>
        </>
      )}
    </div>
  );
};
