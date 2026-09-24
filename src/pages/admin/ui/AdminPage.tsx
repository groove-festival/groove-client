import { useAuthMe } from "@/entities/auth";

import { AdminLoginForm } from "./AdminLoginForm";
import { PromoAdminDashboard } from "./PromoAdminDashboard";
import { PubAdminDashboard } from "./PubAdminDashboard";
import { StageAdminDashboard } from "./StageAdminDashboard";
import { UnsupportedRoleNotice } from "./UnsupportedRoleNotice";

export default function AdminPage() {
  const auth = useAuthMe();

  return (
    <main
      className="font-pretendard min-h-screen bg-[#1c1c1c] text-[#fcfcfc]"
      data-clarity-mask="true"
    >
      {auth.isPending && (
        <p className="px-4 pt-20 pb-16 text-sm text-[#a2a2a2]">
          로그인 상태를 확인하는 중…
        </p>
      )}

      {auth.isError && (
        <div className="flex flex-col items-start gap-3 px-4 pt-20 pb-16">
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

      {!auth.isPending && !auth.isError && auth.data?.loggedIn !== true && (
        <AdminLoginForm />
      )}

      {auth.data?.loggedIn === true && auth.data.role === "PROMO_ADMIN" && (
        <PromoAdminDashboard />
      )}
      {auth.data?.loggedIn === true && auth.data.role === "STAGE_ADMIN" && (
        <StageAdminDashboard />
      )}
      {auth.data?.loggedIn === true && auth.data.role === "PUB_ADMIN" && (
        <PubAdminDashboard />
      )}
      {auth.data?.loggedIn === true &&
        auth.data.role !== "PROMO_ADMIN" &&
        auth.data.role !== "STAGE_ADMIN" &&
        auth.data.role !== "PUB_ADMIN" && <UnsupportedRoleNotice />}
    </main>
  );
}
