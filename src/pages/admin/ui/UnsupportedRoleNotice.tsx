import { AdminHeader } from "./AdminHeader";

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
