import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";

import { AppRouter } from "@/app/routes";

interface QueryProviderProps {
  children: ReactNode;
}

const QueryProvider = ({ children }: QueryProviderProps) => {
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
};

export const AppComposition = () => {
  return (
    <QueryProvider>
      {/* 라우트 독립적인 프레임 크롬. 라우터 컨텍스트가 필요 없어 RouterProvider
          바깥에 둔다. 분석 페이지뷰 추적과 basename은 AppRouter(데이터 라우터)가
          담당한다. */}
      <div className="min-h-dvh bg-white md:bg-[#eceef3]">
        <div className="page-frame mx-auto flex min-h-dvh w-full max-w-[600px] flex-col overflow-x-hidden bg-[#1c1c1c] [--color-background:#1c1c1c] md:shadow-[0_0_20px_rgba(29,32,56,0.14)]">
          <AppRouter />
        </div>
      </div>
    </QueryProvider>
  );
};
