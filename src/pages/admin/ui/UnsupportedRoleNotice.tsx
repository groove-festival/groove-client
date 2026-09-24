import { AdminHeader } from "./AdminHeader";

// 로그인 자체는 됐지만 이 프론트에 아직 대시보드가 없는 역할(PLAN_ADMIN·
// SUPER_ADMIN)을 위한 안내.
export function UnsupportedRoleNotice() {
  return (
    <div className="flex flex-col gap-4 px-4 pt-20 pb-16">
      <AdminHeader title="GROOVE 관리자" />
      <p className="text-sm leading-6 text-[#a2a2a2]">
        이 계정으로 사용할 수 있는 관리자 화면이 아직 없어요.
      </p>
    </div>
  );
}
