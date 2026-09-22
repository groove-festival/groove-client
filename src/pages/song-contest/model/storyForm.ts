import { z } from "zod";

export const colleges = ["IT", "간호", "예술", "사회", "사범", "자연"] as const;
export type College = (typeof colleges)[number];

export const storyFormSchema = z.object({
  college: z.enum(colleges, { error: "단대를 선택해 주세요." }),
  department: z
    .string()
    .trim()
    .min(1, "학과를 입력해 주세요.")
    .max(60, "60자 이내로 입력해 주세요."),
  studentNumber: z
    .string()
    .trim()
    .regex(/^\d{4,20}$/, "학번을 숫자 4~20자리로 입력해 주세요."),
  name: z
    .string()
    .trim()
    .min(1, "이름을 입력해 주세요.")
    .max(30, "30자 이내로 입력해 주세요."),
  nickname: z.string().trim().max(30, "30자 이내로 입력해 주세요."),
  title: z
    .string()
    .trim()
    .min(1, "제목을 입력해 주세요.")
    .max(40, "40자 이내로 입력해 주세요."),
  content: z
    .string()
    .trim()
    .min(1, "사연을 입력해 주세요.")
    .max(500, "500자 이내로 입력해 주세요."),
});

export type StoryFormValues = z.infer<typeof storyFormSchema>;
