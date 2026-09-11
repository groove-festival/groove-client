import { useQueryClient } from "@tanstack/react-query";

import { useAuthMe } from "../api/getAuthMe";
import { useLogout } from "../api/logout";
import { adminPromoQueryKeys } from "../api/queryKeys";
import { isPromoAdmin } from "../model/adminRole";
import { AdminLoginForm } from "./AdminLoginForm";
import { DisplayOrderEditor } from "./DisplayOrderEditor";
import { PhaseOverridePanel } from "./PhaseOverridePanel";
import { SongRequestList } from "./SongRequestList";

export default function AdminPromoPage() {
  const auth = useAuthMe();
  const queryClient = useQueryClient();
  const logoutMutation = useLogout();

  const onLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () =>
        void queryClient.invalidateQueries({
          queryKey: adminPromoQueryKeys.authMe(),
        }),
    });
  };

  return (
    <main className="font-pretendard min-h-screen bg-[#1c1c1c] text-[#fcfcfc]">
      {auth.isPending && (
        <p className="px-4 py-16 text-sm text-[#a2a2a2]">로그인 상태를 확인하는 중…</p>
      )}

      {auth.isError && (
        <div className="flex flex-col items-start gap-3 px-4 py-16">
          <p className="text-sm text-[#a2a2a2]">로그인 상태를 확인하지 못했어요.</p>
          <button
            className="h-10 rounded-xl bg-[#3a3a3a] px-4 text-sm font-semibold"
            onClick={() => void auth.refetch()}
            type="button"
          >
            다시 시도
          </button>
        </div>
      )}

      {!auth.isPending && !auth.isError && !isPromoAdmin(auth.data) && (
        <AdminLoginForm account={auth.data} />
      )}

      {isPromoAdmin(auth.data) && (
        <div className="flex flex-col gap-4 px-4 py-6">
          <header className="flex items-center justify-between">
            <h1 className="text-lg font-bold">GROOVE PLAYLIST 관리자</h1>
            <button
              className="h-9 rounded-lg bg-[#3a3a3a] px-3 text-xs font-semibold disabled:opacity-60"
              disabled={logoutMutation.isPending}
              onClick={onLogout}
              type="button"
            >
              로그아웃
            </button>
          </header>

          <PhaseOverridePanel />
          <DisplayOrderEditor />
          <SongRequestList />
        </div>
      )}
    </main>
  );
}
