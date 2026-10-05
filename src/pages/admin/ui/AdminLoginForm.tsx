import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { ApiError } from "@/shared/api";

import { useAdminLoginSession } from "../model/useAdminSession";
import {
  type AdminLoginFormValues,
  adminLoginFormDefaults,
  adminLoginSchema,
} from "../model/adminLoginForm";

const loginErrorMessage = (error: unknown): string => {
  if (error instanceof ApiError && error.code === "A002") {
    return "아이디 또는 비밀번호가 올바르지 않아요.";
  }
  return "로그인에 실패했어요. 잠시 후 다시 시도해 주세요.";
};

export const AdminLoginForm = () => {
  const login = useAdminLoginSession();

  const {
    formState: { errors, submitCount },
    handleSubmit,
    register,
  } = useForm<AdminLoginFormValues>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: adminLoginFormDefaults,
  });

  const onValid = (values: AdminLoginFormValues) => {
    login.mutate(values);
  };

  const firstErrorMessage =
    submitCount > 0 ? Object.values(errors)[0]?.message : undefined;

  return (
    <div className="font-pretendard flex flex-col gap-6 px-4 pt-20 pb-16 text-[#fcfcfc]">
      <h1 className="text-xl font-bold">GROOVE 관리자</h1>

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
