import { useQuery } from "@tanstack/react-query";

import { httpClient } from "@/shared/api";

// 백엔드 미구현. true인 동안 목 데이터를 돌려준다. 실제 API 연동 시 USE_MOCK을
// false로 바꾸고 MOCK_PLAYLIST와 이 분기를 삭제한다. 타입과 훅은 그대로 둔다.
const USE_MOCK = true;
const MOCK_LATENCY_MS = 400;

export interface PlaylistEntry {
  id: string;
  song: string;
  artist: string;
  college: string;
  nickname: string;
  thumbnailUrl: string | null;
}

const MOCK_PLAYLIST: PlaylistEntry[] = [
  {
    id: "1",
    song: "Ditto",
    artist: "NewJeans",
    college: "IT",
    nickname: "밤샘코딩",
    thumbnailUrl: null,
  },
  {
    id: "2",
    song: "Super Shy",
    artist: "NewJeans",
    college: "간호",
    nickname: "링거맞는중",
    thumbnailUrl: null,
  },
  {
    id: "3",
    song: "손오공",
    artist: "세븐틴",
    college: "예술",
    nickname: "물감쟁이",
    thumbnailUrl: null,
  },
  {
    id: "4",
    song: "Seven",
    artist: "정국",
    college: "사회",
    nickname: "PPT장인",
    thumbnailUrl: null,
  },
  {
    id: "5",
    song: "이브, 프시케 그리고 푸른 수염의 아내",
    artist: "LE SSERAFIM",
    college: "사범",
    nickname: "칠판지우개",
    thumbnailUrl: null,
  },
  {
    id: "6",
    song: "퀸카 (Queencard)",
    artist: "(여자)아이들",
    college: "자연",
    nickname: "실험실좀비",
    thumbnailUrl: null,
  },
  {
    id: "7",
    song: "Spicy",
    artist: "aespa",
    college: "IT",
    nickname: "깃허브전사",
    thumbnailUrl: null,
  },
  {
    id: "8",
    song: "Kitsch",
    artist: "아이브",
    college: "예술",
    nickname: "야작메이트",
    thumbnailUrl: null,
  },
  {
    id: "9",
    song: "I AM",
    artist: "아이브",
    college: "간호",
    nickname: "삼교대요정",
    thumbnailUrl: null,
  },
  {
    id: "10",
    song: "파이팅 해야지",
    artist: "부석순",
    college: "사회",
    nickname: "조모임의신",
    thumbnailUrl: null,
  },
];

export async function getGroovePlaylist(): Promise<PlaylistEntry[]> {
  if (USE_MOCK) {
    return new Promise((resolve) => {
      setTimeout(() => resolve(MOCK_PLAYLIST), MOCK_LATENCY_MS);
    });
  }

  const { data } = await httpClient.get<PlaylistEntry[]>("/playlist");
  return data;
}

export function useGroovePlaylist() {
  return useQuery({
    queryKey: ["groove-playlist"],
    queryFn: getGroovePlaylist,
  });
}
