import { z } from "zod";

export const colleges = ["IT", "간호", "예술", "사회", "사범", "자연"] as const;

export type College = (typeof colleges)[number];

// 노래 신청 폼 계약. 유튜브 뮤직 검색 연동 전이라 곡은 자유 입력 텍스트로 받는다.
export const songRequestSchema = z.object({
  song: z.string().trim().min(1, "곡명을 입력해 주세요."),
  college: z.enum(colleges),
  studentId: z
    .string()
    .trim()
    .regex(/^\d{10}$/, "학번을 숫자 10자리로 입력해 주세요."),
  department: z.string().trim().min(1, "학과를 입력해 주세요."),
  name: z.string().trim().min(1, "이름을 입력해 주세요."),
  nickname: z.string().trim().min(1, "닉네임을 입력해 주세요."),
});

export type SongRequestFormValues = z.infer<typeof songRequestSchema>;

export const songRequestFormDefaults: SongRequestFormValues = {
  song: "",
  college: "IT",
  studentId: "",
  department: "",
  name: "",
  nickname: "",
};
