import { useAdminPub } from "../api/getAdminPub";
import { AdminHeader } from "./AdminHeader";
import { PubAccountForm } from "./PubAccountForm";
import { PubMenuBoardImageField } from "./PubMenuBoardImageField";
import { PubMenuManager } from "./PubMenuManager";
import { PubOrderBoard } from "./PubOrderBoard";
import { PubStatusToggle } from "./PubStatusToggle";
import { PubTableManager } from "./PubTableManager";

// 주막 관리자가 가장 자주 보는 것은 주문이라 상태 토글 바로 아래에 둔다.
// 메뉴·테이블처럼 축제 전에 한 번 세팅하는 것은 아래로 내린다.
export const PubAdminDashboard = () => {
  const pub = useAdminPub();

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
          <PubStatusToggle
            hasAccount={pub.data.account !== null}
            status={pub.data.booth.status}
          />
          <PubOrderBoard />
          <PubAccountForm account={pub.data.account} />
          <PubMenuManager menus={pub.data.menus} />
          <PubMenuBoardImageField menuBoardImageUrl={pub.data.menuBoardImageUrl} />
          <PubTableManager boothCode={pub.data.booth.boothCode} />
        </>
      )}
    </div>
  );
};
