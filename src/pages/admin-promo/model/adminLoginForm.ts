import { z } from "zod";

// 관리자 로그인 폼 계약 (AUTH-2). 서버는 loginId·password 최소 1자를 요구한다.
export const adminLoginSchema = z.object({
  loginId: z.string().trim().min(1, "아이디를 입력해 주세요."),
  password: z.string().min(1, "비밀번호를 입력해 주세요."),
});

export type AdminLoginFormValues = z.infer<typeof adminLoginSchema>;

export const adminLoginFormDefaults: AdminLoginFormValues = {
  loginId: "",
  password: "",
};
