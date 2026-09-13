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
});
