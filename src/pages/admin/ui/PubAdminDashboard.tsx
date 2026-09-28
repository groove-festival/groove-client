import { useSearchParams } from "react-router";

import { useAdminOrders } from "../api/getAdminOrders";
import { useAdminPub } from "../api/getAdminPub";
import { partitionAdminOrders } from "../model/adminOrder";
import { type PubAdminView, pubAdminViews } from "../model/pubAdminView";
import { AdminHeader } from "./AdminHeader";
import { PubAccountForm } from "./PubAccountForm";
import { PubAdminTabBar } from "./PubAdminTabBar";
import { PubKitchenBoard } from "./PubKitchenBoard";
import { PubMenuBoardImageField } from "./PubMenuBoardImageField";
import { PubMenuManager } from "./PubMenuManager";
import { PubOrderHistory } from "./PubOrderHistory";
import { PubPaymentBoard } from "./PubPaymentBoard";
import { PubStatusToggle } from "./PubStatusToggle";
import { PubTableManager } from "./PubTableManager";

const VIEW_PARAM = "view";

const toView = (value: string | null): PubAdminView =>
  pubAdminViews.find((view) => view.id === value)?.id ?? "payment";

// 주막은 입금 확인하는 사람과 조리하는 사람이 다른 기기로 같은 계정을 쓴다.
// 화면을 탭으로 가르고 주소(?view=kitchen)에 남겨, 주방 기기는 그 주소를 열어
// 두기만 하면 된다. 메뉴·테이블처럼 축제 전에 한 번 세팅하는 것은 설정 탭으로
// 뺀다.
export const PubAdminDashboard = () => {
  const pub = useAdminPub();
  const orders = useAdminOrders();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeView = toView(searchParams.get(VIEW_PARAM));
  const activeLabel = pubAdminViews.find((view) => view.id === activeView)?.label;

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
    // 다른 화면은 처음부터 읽는다. 앞 화면의 스크롤 위치를 물려받으면 목록
    // 중간에서 시작해 무엇이 먼저인지 놓친다.
    window.scrollTo({ top: 0 });
  };

  return (
    <div className="min-h-dvh">
      <AdminHeader title={pub.data?.booth.name ?? "주막 관리자"} />

      <div className="flex flex-col gap-4 px-4 pt-4 pb-28">
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
          <section
            aria-labelledby={`pub-admin-${activeView}-tab`}
            className="flex flex-col gap-3"
            id={`pub-admin-${activeView}`}
            role="tabpanel"
          >
            <h2 className="px-1 text-lg font-bold text-[#fcfcfc]">{activeLabel}</h2>
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
                <PubTableManager
                  boothCode={pub.data.booth.boothCode}
                  pubName={pub.data.booth.name}
                />
              </>
            )}
          </section>
        )}
      </div>

      {pub.data && (
        <PubAdminTabBar
          activeView={activeView}
          badgeCounts={badgeCounts}
          onSelect={selectView}
        />
      )}
    </div>
  );
};
