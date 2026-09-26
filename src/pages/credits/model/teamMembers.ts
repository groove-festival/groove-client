import hanNaYoungProfile1x from "../festival-visuals/profile-hannayoung-64.png";
import hanNaYoungProfile2x from "../festival-visuals/profile-hannayoung-128.png";
import hanNaYoungProfile3x from "../festival-visuals/profile-hannayoung-192.png";
import jeonByeongJinProfile1x from "../festival-visuals/profile-jeonbyeongjin-64.png";
import jeonByeongJinProfile2x from "../festival-visuals/profile-jeonbyeongjin-128.png";
import jeonByeongJinProfile3x from "../festival-visuals/profile-jeonbyeongjin-192.png";
import kimJiAnProfile1x from "../festival-visuals/profile-kimjian-64.png";
import kimJiAnProfile2x from "../festival-visuals/profile-kimjian-128.png";
import kimJiAnProfile3x from "../festival-visuals/profile-kimjian-192.png";
import kimJiHunProfile1x from "../festival-visuals/profile-kimjihun-64.png";
import kimJiHunProfile2x from "../festival-visuals/profile-kimjihun-128.png";
import kimJiHunProfile3x from "../festival-visuals/profile-kimjihun-192.png";
import kimTaeHuiProfile from "../festival-visuals/profile-kimtaehui.png";
import seoHyeongCheolProfile from "../festival-visuals/profile-seohyeongcheol.png";
import yunJiMinProfile1x from "../festival-visuals/profile-yunjimin-64.png";
import yunJiMinProfile2x from "../festival-visuals/profile-yunjimin-128.png";
import yunJiMinProfile3x from "../festival-visuals/profile-yunjimin-192.png";

export interface TeamMember {
  name: string;
  affiliation: string | null;
  /** 실데이터가 제공되면 채운다. 없으면 빈 프로필 원을 표시한다. */
  profileImage?: string;
  profileImageSrcSet?: string;
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
        profileImage: yunJiMinProfile2x,
        profileImageSrcSet: `${yunJiMinProfile1x} 1x, ${yunJiMinProfile2x} 2x, ${yunJiMinProfile3x} 3x`,
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
        profileImage: kimJiHunProfile2x,
        profileImageSrcSet: `${kimJiHunProfile1x} 1x, ${kimJiHunProfile2x} 2x, ${kimJiHunProfile3x} 3x`,
        instagram: "hoon_ground",
        github: "hoon-ground",
      },
      {
        name: "배성민",
        affiliation: "심화컴퓨터공학전공 21학번",
        instagram: "bewarmin",
        github: "BaeSeong-min",
      },
      {
        name: "한나영",
        affiliation: "심화컴퓨터공학전공 24학번",
        profileImage: hanNaYoungProfile2x,
        profileImageSrcSet: `${hanNaYoungProfile1x} 1x, ${hanNaYoungProfile2x} 2x, ${hanNaYoungProfile3x} 3x`,
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
        profileImage: yunJiMinProfile2x,
        profileImageSrcSet: `${yunJiMinProfile1x} 1x, ${yunJiMinProfile2x} 2x, ${yunJiMinProfile3x} 3x`,
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
        profileImage: kimJiAnProfile2x,
        profileImageSrcSet: `${kimJiAnProfile1x} 1x, ${kimJiAnProfile2x} 2x, ${kimJiAnProfile3x} 3x`,
        instagram: "khehhaz",
      },
      {
        name: "전병진",
        affiliation: "디자인학과 24학번",
        profileImage: jeonByeongJinProfile2x,
        profileImageSrcSet: `${jeonByeongJinProfile1x} 1x, ${jeonByeongJinProfile2x} 2x, ${jeonByeongJinProfile3x} 3x`,
        instagram: "twojwithinun",
      },
    ],
  },
];
