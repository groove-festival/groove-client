import { useQuery } from "@tanstack/react-query";

import {
  type Booth,
  type BoothMenuItem,
  type BoothMenuResponseBody,
  toBoothMenuItem,
} from "@/entities/booth";
import { type ApiEnvelope, httpClient, requestData } from "@/shared/api";

import { pubAdminQueryKeys } from "./queryKeys";

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

  return bankName && accountNumber && accountHolder
    ? { accountHolder, accountNumber, bankName }
    : null;
};

export async function getAdminPub(): Promise<AdminPub> {
  const response = await requestData<GetAdminPubResponseBody>(() =>
    httpClient.get<ApiEnvelope<GetAdminPubResponseBody>>("/admin/pub/me"),
  );

  return {
    account: toAdminPubAccount(response.account),
    booth: response.pub,
    menuBoardImageUrl: response.menuBoardImageUrl,

    menus: response.menus.map(toBoothMenuItem),
  };
}

export function useAdminPub() {
  return useQuery({ queryKey: pubAdminQueryKeys.me(), queryFn: getAdminPub });
}
