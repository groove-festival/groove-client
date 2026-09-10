import hanNaYoungProfile from "../festival-visuals/profile-hannayoung.png";
import kimJiAnProfile from "../festival-visuals/profile-kimjian.png";
import kimTaeHuiProfile from "../festival-visuals/profile-kimtaehui.png";
import seoHyeongCheolProfile from "../festival-visuals/profile-seohyeongcheol.png";

export interface TeamMember {
  name: string;
  affiliation: string | null;
  /** 실데이터가 제공되면 채운다. 없으면 빈 프로필 원을 표시한다. */
  profileImage?: string;
  instagram?: string | null;
  github?: string | null;
}

export interface CreditSection {
  title: string;
  members: TeamMember[];
}

// 각 팀원의 실제 학과/학번·SNS·프로필 사진을 반영한다. 프로필 사진이 없는
// 팀원은 빈 프로필 원, github이 없는 디자인 파트는 인스타 줄만 표시한다.
export const creditSections: CreditSection[] = [
  {
    title: "기획",
    members: [
      {
        name: "유다경",
        affiliation: "인공지능컴퓨팅전공 25학번",
        instagram: "y__.4_",
        github: "ddkkdkdk",
      },
      {
        name: "윤지민",
        affiliation: "글로벌SW융합전공 22학번",
        instagram: "1a._supernova",
        github: "Y-jimin",
      },
    ],
  },
  {
    title: "프론트엔드",
    members: [
      {
        name: "김지훈",
        affiliation: "글로벌SW융합전공 20학번",
        instagram: "hoon_ground",
        github: "hoon-ground",
      },
      {
        name: "배성민",
        affiliation: "심화컴퓨터공학전공 24학번",
        instagram: "bewarmin",
        github: "BaeSeong-min",
      },
      {
        name: "한나영",
        affiliation: "심화컴퓨터공학전공 24학번",
        profileImage: hanNaYoungProfile,
        instagram: "7o78_8",
        github: "nyoeng",
      },
    ],
  },
  {
    title: "백엔드",
    members: [
      {
        name: "김태희",
        affiliation: "글로벌SW융합전공 24학번",
        profileImage: kimTaeHuiProfile,
        instagram: "kt.gml",
        github: "TaeHuiKKIM",
      },
      {
        name: "윤지민",
        affiliation: "글로벌SW융합전공 22학번",
        instagram: "1a._supernova",
        github: "Y-jimin",
      },
      {
        name: "이상민",
        affiliation: "심화컴퓨터공학전공 23학번",
        instagram: "minn._n__",
        github: "lsmin3388",
      },
    ],
  },
  {
    title: "인프라",
    members: [
      {
        name: "서형철",
        affiliation: "심화컴퓨터공학전공 23학번",
        profileImage: seoHyeongCheolProfile,
        instagram: "hiron_west",
        github: "wjdqh6544",
      },
    ],
  },
  {
    title: "디자인",
    members: [
      {
        name: "김지안",
        affiliation: "디자인학과 25학번",
        profileImage: kimJiAnProfile,
        instagram: "khehhaz",
      },
      { name: "전병진", affiliation: "디자인학과 24학번", instagram: "twojwithinun" },
    ],
  },
];
