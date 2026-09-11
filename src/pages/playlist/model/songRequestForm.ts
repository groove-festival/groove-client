import { z } from "zod";

// 화면 라벨. API enum과 1:1로 매핑한다.
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

// 노래 신청 폼 계약. 곡은 PLST-2 검색 결과에서 고른 trackId로만 받는다 —
// 검색을 거치지 않은 곡은 서버가 거부한다(PLST007). 길이 상한은 명세를 따른다.
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
});

export type SongRequestFormValues = z.infer<typeof songRequestSchema>;

export const songRequestFormDefaults: SongRequestFormValues = {
  trackId: "",
  college: "IT",
  studentId: "",
  department: "",
  name: "",
  nickname: "",
};
