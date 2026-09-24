import { AdminHeader } from "./AdminHeader";

// 로그인 자체는 됐지만 이 프론트에 아직 대시보드가 없는 역할(PUB_ADMIN·
// PLAN_ADMIN 등)을 위한 안내.
export function UnsupportedRoleNotice() {
  return (
    <div className="min-h-dvh">
      <AdminHeader title="GROOVE 관리자" />
      <div className="px-4 py-6">
        <p className="text-sm leading-6 text-[#a2a2a2]">
          이 계정으로 사용할 수 있는 관리자 화면이 아직 없어요.
        </p>
      </div>
    </div>
  );
}
