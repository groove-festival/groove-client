import { z } from "zod";

export const adminLoginSchema = z.object({
  loginId: z.string().trim().min(1, "아이디를 입력해 주세요."),
  password: z.string().min(1, "비밀번호를 입력해 주세요."),
});

export type AdminLoginFormValues = z.infer<typeof adminLoginSchema>;

export const adminLoginFormDefaults: AdminLoginFormValues = {
  loginId: "",
  password: "",
};
