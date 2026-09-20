export const boothFilterOptions = [
  { id: "all", label: "전체" },
  { id: "union", label: "연합" },
  { id: "it", label: "IT대학" },
  { id: "nursing", label: "간호대학" },
  { id: "art", label: "예술대학" },
  { id: "social", label: "사회과학대학" },
  { id: "education", label: "사범대학" },
  { id: "science", label: "자연과학대학" },
] as const;

export type BoothFilter = (typeof boothFilterOptions)[number]["id"];
export type College = Exclude<BoothFilter, "all" | "union">;

export interface Booth {
  colleges: College[];
  departments: string;
  id: string;
  name: string;
}

export const booths: Booth[] = [
  {
    id: "electronics-eh",
    name: "부스 이름",
    departments: "전자공학부E • H",
    colleges: ["it"],
  },
  {
    id: "electronics-b-design",
    name: "부스 이름",
    departments: "전자공학부B • 디자인",
    colleges: ["it", "art"],
  },
  {
    id: "autonomy",
    name: "부스 이름",
    departments: "자율학부 • 첨단 자율학부",
    colleges: ["it"],
  },
  {
    id: "electronics-a-music",
    name: "부스 이름",
    departments: "전자공학부A • 음악학과",
    colleges: ["it", "art"],
  },
  {
    id: "mobile-welfare",
    name: "부스 이름",
    departments: "모바일공학전공 • 사회복지학부",
    colleges: ["it", "social"],
  },
  {
    id: "electrical-sociology",
    name: "부스 이름",
    departments: "전기공학과 • 사회학과",
    colleges: ["it", "social"],
  },
  {
    id: "electronics-cd",
    name: "부스 이름",
    departments: "전자공학부C • D",
    colleges: ["it"],
  },
  {
    id: "home-korean-education",
    name: "부스 이름",
    departments: "가정교육과 • 국어교육과",
    colleges: ["education"],
  },
  {
    id: "education-chemistry",
    name: "부스 이름",
    departments: "교육학과 • 화학교육과",
    colleges: ["education"],
  },
  {
    id: "german-geography-education",
    name: "부스 이름",
    departments: "독어교육전공 • 지리교육과",
    colleges: ["education"],
  },
  {
    id: "biology-math-education",
    name: "부스 이름",
    departments: "생물교육과 • 수학교육과",
    colleges: ["education"],
  },
  {
    id: "english-physical-education",
    name: "부스 이름",
    departments: "영어교육과 • 체육교육과",
    colleges: ["education"],
  },
  {
    id: "geography-library",
    name: "부스 이름",
    departments: "지리학과 • 문헌정보학과",
    colleges: ["social"],
  },
  {
    id: "electronics-f",
    name: "부스 이름",
    departments: "전자공학부F",
    colleges: ["it"],
  },
  {
    id: "nursing",
    name: "부스 이름",
    departments: "간호학과",
    colleges: ["nursing"],
  },
  {
    id: "fine-art",
    name: "부스 이름",
    departments: "미술학과",
    colleges: ["art"],
  },
  {
    id: "physics",
    name: "부스 이름",
    departments: "물리학과",
    colleges: ["science"],
  },
  {
    id: "geology",
    name: "부스 이름",
    departments: "지구시스템과학부 지질학전공",
    colleges: ["science"],
  },
  {
    id: "oceanography",
    name: "부스 이름",
    departments: "지구시스템과학부 해양학전공",
    colleges: ["science"],
  },
  {
    id: "biotechnology",
    name: "부스 이름",
    departments: "생명공학부",
    colleges: ["science"],
  },
  {
    id: "psychology",
    name: "부스 이름",
    departments: "심리학과",
    colleges: ["social"],
  },
  {
    id: "computer-science",
    name: "부스 이름",
    departments: "컴퓨터학부",
    colleges: ["it"],
  },
];

export const getBoothsByFilter = (filter: BoothFilter) => {
  if (filter === "all") {
    return booths;
  }

  if (filter === "union") {
    return booths.filter((booth) => booth.colleges.length > 1);
  }

  return booths.filter((booth) => booth.colleges.includes(filter));
};
