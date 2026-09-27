import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";

import { httpClient } from "@/shared/api";

import { routes } from "./routeConfig";

// 주문 라우트는 PUB-3 응답이 있어야 화면이 뜬다. 여기서는 라우팅만 보므로
// 상차림비 한 줄이면 충분하다.
const orderTableEnvelope = {
  data: {
    success: true,
    error: null,
    data: {
      orderable: true,
      pub: {
        menuBoardImageUrl: null,
        menus: [
          {
            category: "SIDE",
            description: null,
            imageUrl: null,
            menuId: 14,
            name: "상차림비",
            price: 2_000,
            separateCharge: true,
            soldOut: false,
          },
        ],
        pub: {
          area: "PARKING",
          boothCode: "elec-eh",
          colleges: ["IT"],
          departments: ["전자공학부E"],
          description: "전자공학부 주막",
          name: "일렉트로닉 나이트",
          status: "OPEN",
          xRatio: 0.2,
          yRatio: 0.3,
        },
      },
      tableCode: "table-a",
      tableNumber: 3,
    },
  },
  status: 200,
};

const festivalStatusEnvelope = {
  data: {
    success: true,
    error: null,
    data: {
      phase: "BEFORE",
      festivalStartAt: "2026-10-01T00:00:00+09:00",
      festivalEndAt: "2026-10-03T00:00:00+09:00",
      stage: {
        storyPhase: "BEFORE",
        storyCollectionStartAt: "2026-09-20T00:00:00+09:00",
        storyCollectionEndAt: "2026-09-30T00:00:00+09:00",
        contestPhase: "BEFORE",
        contestStartAt: "2026-10-01T18:00:00+09:00",
        contestEndAt: "2026-10-01T21:00:00+09:00",
      },
      playlist: {
        phase: "SUBMISSION",
        submissionStartAt: "2026-09-12T00:00:00+09:00",
        submissionEndAt: "2026-09-17T00:00:00+09:00",
        publishAt: "2026-10-01T00:00:00+09:00",
      },
    },
  },
  status: 200,
};

// 데이터를 부르는 화면이 섞여 있어 라우팅만 보는 이 검사에도 쿼리 클라이언트가 필요하다.
const renderRoute = (path: string) => {
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
};

describe("AppRouter", () => {
  it("renders the not-found fallback without the shared header", () => {
    renderRoute("/missing");

    expect(
      screen.getByRole("heading", { name: "페이지를 찾을 수 없어요" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "홈으로 가기" })).toHaveAttribute(
      "href",
      "/",
    );
    expect(screen.queryByRole("button", { name: "메뉴 열기" })).not.toBeInTheDocument();
    expect(screen.getAllByRole("contentinfo")).toHaveLength(1);
    expect(screen.getByRole("link", { name: "개인정보처리방침" })).toHaveAttribute(
      "href",
      "https://knu-cse-sysdev.notion.site/festival-personal-info-processing-policy",
    );
    expect(screen.getByRole("link", { name: "서비스 이용약관" })).toHaveAttribute(
      "href",
      "https://knu-cse-sysdev.notion.site/festival-terms-of-services",
    );
    expect(screen.getByRole("link", { name: "이메일무단수집거부" })).toHaveAttribute(
      "href",
      "https://knu-cse-sysdev.notion.site/email-address-harvesting-prohibited",
    );
  });

  it("renders the shared header and one policy footer on a normal route", () => {
    const router = createMemoryRouter(routes, { initialEntries: ["/coming-soon"] });
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    render(
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>,
    );

    expect(screen.getByRole("button", { name: "메뉴 열기" })).toBeInTheDocument();
    expect(screen.getAllByRole("contentinfo")).toHaveLength(1);
    expect(screen.getByText(/공식 SNS에서 확인해 주세요/)).toBeInTheDocument();
  });

  it("renders the admin page without the festival header and footer", async () => {
    const get = vi.spyOn(httpClient, "get").mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          account: {
            loggedIn: false,
            role: null,
            displayName: null,
            pubId: null,
          },
        },
        error: null,
      },
      status: 200,
    });

    renderRoute("/admin");

    expect(
      await screen.findByRole("heading", { name: "GROOVE 관리자" }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "메뉴 열기" })).not.toBeInTheDocument();
    expect(screen.queryByRole("contentinfo")).not.toBeInTheDocument();

    get.mockRestore();
  });

  it("renders the table order page outside the shared layout", async () => {
    Object.defineProperty(window, "scrollTo", { configurable: true, value: vi.fn() });
    const get = vi.spyOn(httpClient, "get").mockResolvedValue(orderTableEnvelope);
    renderRoute("/pub/elec-eh/table-a");

    expect(await screen.findByRole("list", { name: "상차림비" })).toBeInTheDocument();
    expect(screen.getAllByRole("img", { name: "GROOVE" })).toHaveLength(1);
    expect(screen.queryByRole("link", { name: "GROOVE 홈" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "메뉴 열기" })).not.toBeInTheDocument();

    get.mockRestore();
  });

  it("renders the main page at the root path", () => {
    renderRoute("/");

    expect(screen.getByRole("heading", { name: "축제 전체 지도" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "메뉴 열기" })).toBeInTheDocument();
  });

  it("renders the event page inside the shared layout", () => {
    renderRoute("/event");

    expect(screen.getByRole("heading", { name: "GRO-OVE ZONE" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "메뉴 열기" })).toBeInTheDocument();
  });

  it("renders story collection and song contest at separate routes", async () => {
    const get = vi.spyOn(httpClient, "get").mockImplementation((url: string) => {
      if (url === "/festival/status") {
        return Promise.resolve(festivalStatusEnvelope);
      }
      if (url === "/contest/votes") {
        return Promise.resolve({
          data: { success: true, error: null, data: [] },
          status: 200,
        });
      }
      return Promise.resolve({
        data: {
          success: true,
          error: null,
          data: { loggedIn: false, role: null, displayName: null, pubId: null },
        },
        status: 200,
      });
    });

    const story = renderRoute("/story");
    expect(
      await screen.findByRole("heading", { name: "사연 모집을 준비하고 있어요" }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("tab", { name: "타임테이블" })).not.toBeInTheDocument();
    story.unmount();

    renderRoute("/contest");
    expect(await screen.findByRole("tab", { name: "타임테이블" })).toBeInTheDocument();
    expect(screen.queryByText("사연 모집을 준비하고 있어요")).not.toBeInTheDocument();

    get.mockRestore();
  });
});
