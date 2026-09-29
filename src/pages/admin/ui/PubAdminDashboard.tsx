import { useSearchParams } from "react-router";

import { useAdminOrders } from "../api/getAdminOrders";
import { type AdminPub, useAdminPub } from "../api/getAdminPub";
import { useAdminTables } from "../api/getAdminTables";
import { partitionAdminOrders } from "../model/adminOrder";
import { type PubAdminView, pubAdminViews } from "../model/pubAdminView";
import { filterOrdersByTables } from "../model/tableFilter";
import { useTableFilter } from "../model/useTableFilter";
import { AdminHeader } from "./AdminHeader";
import { PubAccountForm } from "./PubAccountForm";
import { PubAdminTabBar } from "./PubAdminTabBar";
import { PubKitchenBoard } from "./PubKitchenBoard";
import { PubMenuBoardImageField } from "./PubMenuBoardImageField";
import { PubMenuManager } from "./PubMenuManager";
import { PubOrderHistory } from "./PubOrderHistory";
import { PubPaymentBoard } from "./PubPaymentBoard";
import { PubProfileForm } from "./PubProfileForm";
import { PubStatusToggle } from "./PubStatusToggle";
import { PubTableOrders } from "./PubTableOrders";
import { PubTableManager } from "./PubTableManager";
import { TableFilterSheet } from "./TableFilterSheet";

const VIEW_PARAM = "view";

const toView = (value: string | null): PubAdminView =>
  pubAdminViews.find((view) => view.id === value)?.id ?? "payment";

interface PubAdminWorkspaceProps {
  pub: AdminPub;
}

// 주막 정보를 받은 뒤의 화면. 담당 테이블 필터가 주막 코드별로 저장되므로
// 주막을 안 뒤에야 만든다.
const PubAdminWorkspace = ({ pub }: PubAdminWorkspaceProps) => {
  const orders = useAdminOrders();
  const tables = useAdminTables();
  const tableFilter = useTableFilter(pub.booth.boothCode);
  const [searchParams, setSearchParams] = useSearchParams();
  const activeView = toView(searchParams.get(VIEW_PARAM));
  const activeLabel = pubAdminViews.find((view) => view.id === activeView)?.label;
  const allOrders = orders.data ?? [];

  // 탭 배지도 담당 테이블 기준이다. 남의 테이블 주문으로 배지가 뜨면 알바생이
  // 자기 일인 줄 알고 들어가 본다.
  const board = partitionAdminOrders(
    filterOrdersByTables(allOrders, tableFilter.tables),
    orders.dataUpdatedAt,
  );
  const badgeCounts: Partial<Record<PubAdminView, number>> = {
    payment: board.depositClaimed.length + board.pendingDeposit.length,
    kitchen: board.paid.length,
  };

  // 테이블 목록을 못 받았으면 주문에 나온 테이블로라도 고르게 한다.
  const tableNumbers = tables.data
    ? tables.data.map((table) => table.tableNumber).sort((a, b) => a - b)
    : [...new Set(allOrders.map((order) => order.tableNumber))].sort((a, b) => a - b);

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
    <>
      <section
        aria-labelledby={`pub-admin-${activeView}-tab`}
        className="flex flex-col gap-3"
        id={`pub-admin-${activeView}`}
        role="tabpanel"
      >
        <div className="flex items-center justify-between gap-3 px-1">
          <h2 className="text-lg font-bold text-[#fcfcfc]">{activeLabel}</h2>
          {activeView !== "settings" && (
            <TableFilterSheet
              onChange={tableFilter.changeTables}
              tableNumbers={tableNumbers}
              tables={tableFilter.tables}
            />
          )}
        </div>
        {activeView === "payment" && (
          <PubPaymentBoard visibleTables={tableFilter.tables} />
        )}
        {activeView === "kitchen" && (
          <PubKitchenBoard visibleTables={tableFilter.tables} />
        )}
        {activeView === "tables" && (
          <PubTableOrders
            tableNumbers={tables.data?.map((table) => table.tableNumber) ?? []}
            visibleTables={tableFilter.tables}
          />
        )}
        {activeView === "history" && (
          <PubOrderHistory
            pubName={pub.booth.name}
            visibleTables={tableFilter.tables}
          />
        )}
        {activeView === "settings" && (
          <>
            <PubProfileForm booth={pub.booth} />
            <PubStatusToggle
              hasAccount={pub.account !== null}
              status={pub.booth.status}
            />
            <PubAccountForm account={pub.account} />
            <PubMenuManager menus={pub.menus} />
            <PubMenuBoardImageField menuBoardImageUrl={pub.menuBoardImageUrl} />
            <PubTableManager boothCode={pub.booth.boothCode} pubName={pub.booth.name} />
          </>
        )}
      </section>

      <PubAdminTabBar
        activeView={activeView}
        badgeCounts={badgeCounts}
        onSelect={selectView}
      />
    </>
  );
};

// 주막은 입금 확인하는 사람과 조리하는 사람이 다른 기기로 같은 계정을 쓴다.
// 화면을 탭으로 가르고 주소(?view=kitchen)에 남겨, 주방 기기는 그 주소를 열어
// 두기만 하면 된다. 메뉴·테이블처럼 축제 전에 한 번 세팅하는 것은 설정 탭으로
// 뺀다.
export const PubAdminDashboard = () => {
  const pub = useAdminPub();

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

        {pub.data && <PubAdminWorkspace pub={pub.data} />}
      </div>
    </div>
  );
};
