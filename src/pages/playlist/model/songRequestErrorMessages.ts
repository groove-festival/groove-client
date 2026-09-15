import { ApiError } from "@/shared/api";

const DEFAULT_SEARCH_ERROR_MESSAGE = "검색에 실패했어요. 잠시 후 다시 시도해 주세요.";
const DEFAULT_SUBMIT_ERROR_MESSAGE = "신청에 실패했어요. 잠시 후 다시 시도해 주세요.";

const searchErrorMessages: ReadonlyMap<string, string> = new Map([
  ["PLST005", "곡 검색 서비스에 문제가 생겼어요. 잠시 후 다시 시도해 주세요."],
  ["PLST001", "지금은 접수 기간이 아니에요."],
  ["C001", "검색어를 확인해 주세요."],
]);

const submitErrorMessages: ReadonlyMap<string, string> = new Map([
  ["PLST009", "신청이 몰려 잠시 제한됐어요. 잠시 후 다시 시도해 주세요."],
  ["PLST007", "곡 정보가 만료됐어요. 곡을 다시 검색해서 선택해 주세요."],
  ["PLST010", "이미 다른 사람이 신청한 곡입니다. 다른 곡을 선택해주세요."],
  ["PLST001", "지금은 접수 기간이 아니에요."],
]);

export function searchErrorMessage(error: unknown): string {
  return error instanceof ApiError
    ? (searchErrorMessages.get(error.code) ?? DEFAULT_SEARCH_ERROR_MESSAGE)
    : DEFAULT_SEARCH_ERROR_MESSAGE;
}

export function submitErrorMessage(error: unknown): string {
  return error instanceof ApiError
    ? (submitErrorMessages.get(error.code) ?? DEFAULT_SUBMIT_ERROR_MESSAGE)
    : DEFAULT_SUBMIT_ERROR_MESSAGE;
}
