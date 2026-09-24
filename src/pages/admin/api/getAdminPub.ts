import { useQuery } from "@tanstack/react-query";

import {
  type Booth,
  type BoothMenuItem,
  type BoothMenuResponseBody,
  toBoothMenuItem,
} from "@/entities/booth";
import { type ApiEnvelope, httpClient, requestData } from "@/shared/api";

import { pubAdminQueryKeys } from "./queryKeys";

// 대표자 계좌. 등록 전에는 서버가 account 자체를 비우거나 필드를 비워 보낼 수
// 있어 둘 다 "미등록"으로 접는다. 계좌가 없으면 손님 주문이 409(PUB006)로
// 막히므로 대시보드가 이 값으로 경고를 띄운다.
export interface AdminPubAccount {
  accountHolder: string;
  accountNumber: string;
  bankName: string;
}

interface AdminPubAccountResponseBody {
  accountHolder?: string | null;
  accountNumber?: string | null;
  bankName?: string | null;
}

// PUB-A1 응답의 pub 블록. 부스 요약(PUB-1)과 같은 모양에 pubId만 더 온다.
interface AdminPubBlockResponseBody extends Booth {
  pubId: number;
}

export interface GetAdminPubResponseBody {
  account: AdminPubAccountResponseBody | null;
  menuBoardImageUrl: string | null;
  menus: BoothMenuResponseBody[];
  pub: AdminPubBlockResponseBody;
}

export interface AdminPub {
  account: AdminPubAccount | null;
  booth: AdminPubBlockResponseBody;
  menuBoardImageUrl: string | null;
  menus: BoothMenuItem[];
}

export const toAdminPubAccount = (
  account: AdminPubAccountResponseBody | null | undefined,
): AdminPubAccount | null => {
  const bankName = account?.bankName?.trim() ?? "";
  const accountNumber = account?.accountNumber?.trim() ?? "";
  const accountHolder = account?.accountHolder?.trim() ?? "";

  // 셋 중 하나라도 비면 손님에게 보여줄 수 없는 계좌다. 미등록으로 다룬다.
  return bankName && accountNumber && accountHolder
    ? { accountHolder, accountNumber, bankName }
    : null;
};

// PUB-A1. 대시보드 진입 시 상태·계좌·메뉴판 사진·메뉴를 한 번에 불러온다.
export async function getAdminPub(): Promise<AdminPub> {
  const response = await requestData<GetAdminPubResponseBody>(() =>
    httpClient.get<ApiEnvelope<GetAdminPubResponseBody>>("/admin/pub/me"),
  );

  return {
    account: toAdminPubAccount(response.account),
    booth: response.pub,
    menuBoardImageUrl: response.menuBoardImageUrl,
    // 관리자 화면은 손님 화면과 달리 분류별로 묶지 않고 등록 순서 그대로
    // 나열한다. 수정·삭제 대상을 찾는 목록이라 서버 정렬을 그대로 쓴다.
    menus: response.menus.map(toBoothMenuItem),
  };
}

export function useAdminPub() {
  return useQuery({ queryKey: pubAdminQueryKeys.me(), queryFn: getAdminPub });
}
