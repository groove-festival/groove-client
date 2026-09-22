import { render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";

import { routes } from "./routeConfig";

describe("AppRouter", () => {
  it("renders the not-found fallback without the shared header", () => {
    const router = createMemoryRouter(routes, { initialEntries: ["/missing"] });
    render(<RouterProvider router={router} />);

    expect(
      screen.getByRole("heading", { name: "페이지를 찾을 수 없어요" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "홈으로 가기" })).toHaveAttribute(
      "href",
      "/",
    );
    expect(screen.queryByRole("button", { name: "메뉴 열기" })).not.toBeInTheDocument();
  });

  it("renders the table order page outside the shared layout", () => {
    Object.defineProperty(window, "scrollTo", { configurable: true, value: vi.fn() });
    const router = createMemoryRouter(routes, {
      initialEntries: ["/pub/electronics-eh/table-a"],
    });
    render(<RouterProvider router={router} />);

    expect(screen.getAllByRole("img", { name: "GROOVE" })).toHaveLength(1);
    expect(screen.queryByRole("link", { name: "GROOVE 홈" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "메뉴 열기" })).not.toBeInTheDocument();
    expect(screen.getByRole("list", { name: "상차림비" })).toBeInTheDocument();
  });

  it("renders the main page at the root path", () => {
    const router = createMemoryRouter(routes, { initialEntries: ["/"] });
    render(<RouterProvider router={router} />);

    expect(screen.getByRole("heading", { name: "축제 전체 지도" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "메뉴 열기" })).toBeInTheDocument();
  });
});
