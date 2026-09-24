import { useQueryClient } from "@tanstack/react-query";

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
    <header className="flex items-center justify-between">
      <h1 className="text-lg font-bold">{title}</h1>
      <button
        className="h-9 rounded-lg bg-[#3a3a3a] px-3 text-xs font-semibold disabled:opacity-60"
        disabled={logoutMutation.isPending}
        onClick={onLogout}
        type="button"
      >
        로그아웃
      </button>
    </header>
  );
}
