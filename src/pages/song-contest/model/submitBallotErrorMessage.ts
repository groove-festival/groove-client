import { ApiError } from "@/shared/api";

const DEFAULT_MESSAGE = "투표에 실패했어요. 잠시 후 다시 시도해 주세요.";

const messages: ReadonlyMap<string, string> = new Map([
  ["SING007", "이미 마감된 경기예요. 목록을 새로고침해 주세요."],
  ["SING006", "이미 투표한 경기예요."],
  ["SING004", "존재하지 않는 경기예요. 목록을 새로고침해 주세요."],
  ["SING009", "존재하지 않는 참가팀이에요. 목록을 새로고침해 주세요."],
]);

export function submitBallotErrorMessage(error: unknown): string {
  return error instanceof ApiError
    ? (messages.get(error.code) ?? DEFAULT_MESSAGE)
    : DEFAULT_MESSAGE;
}
