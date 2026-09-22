import { useQuery } from "@tanstack/react-query";

import { ApiError, type ApiEnvelope, httpClient, requestData } from "@/shared/api";

import type { BoothDetail, BoothMenuItem, MenuCategory } from "../model/boothDetail";
import { createBoothMenuSections } from "../model/boothDetail";
import type { Booth } from "../model/booths";
import { boothQueryKeys } from "./queryKeys";

interface BoothMenuResponseBody {
  category: MenuCategory;
  description: string | null;
  imageUrl: string | null;
  menuId: number;
  name: string;
  price: number;
  separateCharge: boolean;
  soldOut: boolean;
}

interface BoothDetailResponseBody {
  menuBoardImageUrl: string | null;
  menus: BoothMenuResponseBody[];
  pub: Booth;
}

const toBoothMenuItem = (menu: BoothMenuResponseBody): BoothMenuItem => ({
  category: menu.category,
  description: menu.description,
  id: menu.menuId,
  imageUrl: menu.imageUrl,
  isSoldOut: menu.soldOut,
  name: menu.name,
  price: menu.price,
  separateCharge: menu.separateCharge,
});

export function isBoothNotFound(error: unknown): boolean {
  return error instanceof ApiError && error.code === "PUB002";
}

export async function getBoothDetail(boothCode: string): Promise<BoothDetail> {
  const response = await requestData<BoothDetailResponseBody>(() =>
    httpClient.get<ApiEnvelope<BoothDetailResponseBody>>(
      `/pubs/${encodeURIComponent(boothCode)}`,
    ),
  );

  return {
    ...response.pub,
    menuBoardImageUrl: response.menuBoardImageUrl,
    menuSections: createBoothMenuSections(response.menus.map(toBoothMenuItem)),
  };
}

export function useBoothDetail(boothCode: string | undefined) {
  return useQuery({
    queryKey: boothQueryKeys.detail(boothCode ?? ""),
    queryFn: () => getBoothDetail(boothCode ?? ""),
    enabled: Boolean(boothCode),
    retry: (failureCount, error) => !isBoothNotFound(error) && failureCount < 1,
  });
}
