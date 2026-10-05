import { z } from "zod";

export const colleges = ["IT", "간호", "예술", "사회", "사범", "자연"] as const;

export type College = (typeof colleges)[number];

export type ApiCollege = "IT" | "NURSING" | "ART" | "SOCIAL" | "EDU" | "NATURE";

export const collegeToApiValue: Record<College, ApiCollege> = {
  IT: "IT",
  간호: "NURSING",
  예술: "ART",
  사회: "SOCIAL",
  사범: "EDU",
  자연: "NATURE",
};

export const songRequestSchema = z.object({
  trackId: z.string().min(1, "곡을 검색해서 선택해 주세요."),
  college: z.enum(colleges),
  studentId: z
    .string()
    .trim()
    .regex(/^\d{10}$/, "학번을 숫자 10자리로 입력해 주세요."),
  department: z
    .string()
    .trim()
    .min(1, "학과를 입력해 주세요.")
    .max(60, "학과가 너무 길어요."),
  name: z
    .string()
    .trim()
    .min(1, "이름을 입력해 주세요.")
    .max(30, "이름이 너무 길어요."),
  nickname: z
    .string()
    .trim()
    .min(1, "닉네임을 입력해 주세요.")
    .max(30, "닉네임이 너무 길어요."),
  termsAgreed: z
    .boolean()
    .refine((isAgreed) => isAgreed, "GROOVE 웹서비스 이용약관에 동의해 주세요."),
  personalInfoCollectionAgreed: z
    .boolean()
    .refine((isAgreed) => isAgreed, "개인정보 수집 및 이용에 동의해 주세요."),
});

export type SongRequestFormValues = z.infer<typeof songRequestSchema>;

export interface CompletedSong {
  title: string;
  artist?: string | null;
  albumCoverUrl?: string | null;
}

export const songRequestFormDefaults: SongRequestFormValues = {
  trackId: "",
  college: "IT",
  studentId: "",
  department: "",
  name: "",
  nickname: "",
  termsAgreed: false,
  personalInfoCollectionAgreed: false,
};
