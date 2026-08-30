import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type PropsWithChildren } from "react";
import { BrowserRouter } from "react-router";

import { AppRouter } from "@/app/routes";
import { appConfig } from "@/shared/config";

function QueryProvider({ children }: PropsWithChildren) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            retry: 1,
            staleTime: 30_000,
          },
          mutations: {
            retry: 0,
          },
        },
      }),
  );

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

export function AppComposition() {
  return (
    <QueryProvider>
      <BrowserRouter basename={appConfig.basePath}>
        <AppRouter />
      </BrowserRouter>
    </QueryProvider>
  );
}
