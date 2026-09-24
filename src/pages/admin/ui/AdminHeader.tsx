import { useQueryClient } from "@tanstack/react-query";
import { LogOut } from "lucide-react";

import { authQueryKeys, useLogout } from "@/entities/auth";

interface AdminHeaderProps {
  title: string;
}

// 역할별 대시보드가 공용으로 쓰는 상단 바(제목 + 로그아웃).
export function AdminHeader({ title }: AdminHeaderProps) {
  const queryClient = useQueryClient();
  const logoutMutation = useLogout();

  const onLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () =>
        void queryClient.invalidateQueries({ queryKey: authQueryKeys.me() }),
    });
  };

  return (
    <header className="sticky top-0 z-50 h-20 border-b border-[#3a3a3a] bg-[rgba(28,28,28,0.92)] px-4 backdrop-blur-[12px]">
      <div className="flex h-full items-center justify-between">
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] font-semibold tracking-[0.16em] text-[#a2a2a2]">
            GROOVE ADMIN
          </span>
          <h1 className="text-lg font-bold">{title}</h1>
        </div>

        <button
          className="flex h-10 items-center gap-2 rounded-xl bg-[#323232] px-3 text-xs font-semibold text-[#fcfcfc] hover:bg-[#3a3a3a] disabled:opacity-60"
          disabled={logoutMutation.isPending}
          onClick={onLogout}
          type="button"
        >
          <LogOut aria-hidden="true" size={17} strokeWidth={1.8} />
          {logoutMutation.isPending ? "로그아웃 중…" : "로그아웃"}
        </button>
      </div>
    </header>
  );
}
