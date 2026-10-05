import { useMutation, useQueryClient, type QueryClient } from "@tanstack/react-query";

import { authQueryKeys, logout, type AdminAccount } from "@/entities/auth";

import { adminLogin, type AdminLoginResponseBody } from "../api/adminLogin";
import {
  planAdminQueryKeys,
  promoAdminQueryKeys,
  pubAdminQueryKeys,
  stageAdminQueryKeys,
} from "../api/queryKeys";

const adminCacheRoots = [
  planAdminQueryKeys.all()[0],
  promoAdminQueryKeys.all()[0],
  pubAdminQueryKeys.all()[0],
  stageAdminQueryKeys.all()[0],
];

const replaceAdminSession = async (
  queryClient: QueryClient,
  login: AdminLoginResponseBody | null,
) => {
  const privateQueries = {
    predicate: (query: { queryKey: readonly unknown[] }) =>
      adminCacheRoots.some((root) => query.queryKey[0] === root),
  };

  await Promise.all([
    queryClient.cancelQueries(privateQueries),
    queryClient.cancelQueries({ queryKey: authQueryKeys.me() }),
  ]);
  queryClient.removeQueries(privateQueries);
  queryClient.setQueryData<AdminAccount>(authQueryKeys.me(), {
    loggedIn: login !== null,
    role: login?.role ?? null,
    pubId: login?.pubId ?? null,
    displayName: null,
  });
  await queryClient.invalidateQueries({ queryKey: authQueryKeys.me() });
};

export const useAdminLoginSession = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adminLogin,
    onSuccess: (login) => replaceAdminSession(queryClient, login),
  });
};

export const useAdminLogoutSession = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: logout,
    onSuccess: () => replaceAdminSession(queryClient, null),
  });
};
