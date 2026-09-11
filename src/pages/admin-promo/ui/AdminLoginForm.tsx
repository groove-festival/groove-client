import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";

import { ApiError } from "@/shared/api";

import { useAdminLogin } from "../api/adminLogin";
import { useLogout } from "../api/logout";
import { adminPromoQueryKeys } from "../api/queryKeys";
import {
  type AdminLoginFormValues,
  adminLoginFormDefaults,
  adminLoginSchema,
} from "../model/adminLoginForm";
import { type AdminAccount, PROMO_ADMIN_ROLE } from "../model/adminRole";

interface AdminLoginFormProps {
  // 이미 로그인돼 있지만 홍보팀 관리자가 아닌 경우를 구분하기 위해 넘긴다.
  account: AdminAccount | undefined;
}

const loginErrorMessage = (error: unknown): string => {
  if (error instanceof ApiError && error.code === "A002") {
    return "아이디 또는 비밀번호가 올바르지 않아요.";
  }
  return "로그인에 실패했어요. 잠시 후 다시 시도해 주세요.";
};

export const AdminLoginForm = ({ account }: AdminLoginFormProps) => {
  const queryClient = useQueryClient();
  const login = useAdminLogin();
  const logoutMutation = useLogout();

  const {
    formState: { errors, submitCount },
    handleSubmit,
    register,
  } = useForm<AdminLoginFormValues>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: adminLoginFormDefaults,
  });

  const loggedInAsOther =
    account?.loggedIn === true && account.role !== PROMO_ADMIN_ROLE;
  // 로그인은 됐으나 role이 홍보팀이 아닌 경우 (응답 role로 판정).
  const wrongRole = login.isSuccess && login.data.role !== PROMO_ADMIN_ROLE;

  const invalidateAuth = () =>
    queryClient.invalidateQueries({ queryKey: adminPromoQueryKeys.authMe() });

  const onValid = (values: AdminLoginFormValues) => {
    login.mutate(values, {
      onSuccess: (result) => {
        if (result.role === PROMO_ADMIN_ROLE) {
          void invalidateAuth();
        }
      },
    });
  };

  const onLogout = () => {
    logoutMutation.mutate(undefined, { onSuccess: () => void invalidateAuth() });
  };

  const firstErrorMessage =
    submitCount > 0 ? Object.values(errors)[0]?.message : undefined;

  if (loggedInAsOther || wrongRole) {
    return (
      <div className="font-pretendard flex flex-col gap-4 px-4 py-16 text-[#fcfcfc]">
        <h1 className="text-xl font-bold">GROOVE PLAYLIST 관리자</h1>
        <p className="text-sm leading-6 text-[#a2a2a2]">
          홍보팀 관리자 계정이 아니에요. 이 페이지는 홍보팀 관리자만 사용할 수 있습니다.
        </p>
        <button
          className="h-11 w-full rounded-xl bg-[#4a4a4a] text-sm font-semibold disabled:opacity-60"
          disabled={logoutMutation.isPending}
          onClick={onLogout}
          type="button"
        >
          로그아웃
        </button>
      </div>
    );
  }

  return (
    <div className="font-pretendard flex flex-col gap-6 px-4 py-16 text-[#fcfcfc]">
      <h1 className="text-xl font-bold">GROOVE PLAYLIST 관리자</h1>

      <form className="flex flex-col gap-4" onSubmit={handleSubmit(onValid)}>
        <label className="flex flex-col gap-1.5 text-sm font-medium">
          아이디
          <input
            autoComplete="username"
            className="h-11 rounded-xl border border-[#5d5d5d] bg-[#323232] px-4 text-sm outline-none focus:border-[#00ffff]"
            {...register("loginId")}
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium">
          비밀번호
          <input
            autoComplete="current-password"
            className="h-11 rounded-xl border border-[#5d5d5d] bg-[#323232] px-4 text-sm outline-none focus:border-[#00ffff]"
            type="password"
            {...register("password")}
          />
        </label>

        {firstErrorMessage && (
          <p className="text-xs text-[#ff5b5b]">{firstErrorMessage}</p>
        )}
        {login.isError && (
          <p className="text-xs text-[#ff5b5b]">{loginErrorMessage(login.error)}</p>
        )}

        <button
          className="h-11 rounded-xl bg-[#5d00ff] text-sm font-semibold disabled:opacity-60"
          disabled={login.isPending}
          type="submit"
        >
          로그인
        </button>
      </form>
    </div>
  );
};
