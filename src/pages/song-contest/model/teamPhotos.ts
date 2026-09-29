import team01x80 from "../festival-visuals/team-01-80.jpg";
import team01x160 from "../festival-visuals/team-01-160.jpg";
import team01x240 from "../festival-visuals/team-01-240.jpg";
import team02x80 from "../festival-visuals/team-02-80.jpg";
import team02x160 from "../festival-visuals/team-02-160.jpg";
import team02x240 from "../festival-visuals/team-02-240.jpg";
import team03x80 from "../festival-visuals/team-03-80.jpg";
import team03x160 from "../festival-visuals/team-03-160.jpg";
import team03x240 from "../festival-visuals/team-03-240.jpg";
import team04x80 from "../festival-visuals/team-04-80.jpg";
import team04x160 from "../festival-visuals/team-04-160.jpg";
import team04x240 from "../festival-visuals/team-04-240.jpg";
import team05x80 from "../festival-visuals/team-05-80.jpg";
import team05x160 from "../festival-visuals/team-05-160.jpg";
import team05x240 from "../festival-visuals/team-05-240.jpg";
import team06x80 from "../festival-visuals/team-06-80.jpg";
import team06x160 from "../festival-visuals/team-06-160.jpg";
import team06x240 from "../festival-visuals/team-06-240.jpg";
import team07x80 from "../festival-visuals/team-07-80.jpg";
import team07x160 from "../festival-visuals/team-07-160.jpg";
import team07x240 from "../festival-visuals/team-07-240.jpg";
import team08x80 from "../festival-visuals/team-08-80.jpg";
import team08x160 from "../festival-visuals/team-08-160.jpg";
import team08x240 from "../festival-visuals/team-08-240.jpg";
import team09x80 from "../festival-visuals/team-09-80.jpg";
import team09x160 from "../festival-visuals/team-09-160.jpg";
import team09x240 from "../festival-visuals/team-09-240.jpg";
import team10x80 from "../festival-visuals/team-10-80.jpg";
import team10x160 from "../festival-visuals/team-10-160.jpg";
import team10x240 from "../festival-visuals/team-10-240.jpg";
import team11x80 from "../festival-visuals/team-11-80.jpg";
import team11x160 from "../festival-visuals/team-11-160.jpg";
import team11x240 from "../festival-visuals/team-11-240.jpg";
import team12x80 from "../festival-visuals/team-12-80.jpg";
import team12x160 from "../festival-visuals/team-12-160.jpg";
import team12x240 from "../festival-visuals/team-12-240.jpg";

// 가요제 참가팀 사진. API(SING-1)는 팀 이름만 내려주므로 이름으로 사진을 찾는다.
// 12팀은 서버 대진표 적재(ContestBracketInitializer)에서 이름이 고정되고, 2·3라운드도
// 같은 이름으로 올라가므로 이름이 곧 열쇠다. 키 순서는 대진표 왼쪽부터 1~12번이다.
// ⚠️ 서버에서 팀 이름을 바꾸면 여기도 함께 바꾼다. 못 찾으면 빈 원을 그린다.
export interface TeamPhoto {
  src: string;
  srcSet: string;
}

const photo = (x1: string, x2: string, x3: string): TeamPhoto => ({
  src: x2,
  srcSet: `${x1} 1x, ${x2} 2x, ${x3} 3x`,
});

const teamPhotos: Record<string, TeamPhoto> = {
  오채원샷: photo(team01x80, team01x160, team01x240),
  어리고싶다: photo(team02x80, team02x160, team02x240),
  지문: photo(team03x80, team03x160, team03x240),
  이쌩훈: photo(team04x80, team04x160, team04x240),
  치이카와: photo(team05x80, team05x160, team05x240),
  테리: photo(team06x80, team06x160, team06x240),
  권용수: photo(team07x80, team07x160, team07x240),
  꼴등보컬: photo(team08x80, team08x160, team08x240),
  탐앤탐스: photo(team09x80, team09x160, team09x240),
  마진보이: photo(team10x80, team10x160, team10x240),
  알록달록: photo(team11x80, team11x160, team11x240),
  양념감자: photo(team12x80, team12x160, team12x240),
};

export const getTeamPhoto = (name: string): TeamPhoto | undefined =>
  teamPhotos[name.trim()];
