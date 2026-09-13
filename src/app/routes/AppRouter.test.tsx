import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";

import { AppRouter } from "./AppRouter";

describe("AppRouter", () => {
  it("renders the not-found fallback without the shared header", () => {
    render(
      <MemoryRouter initialEntries={["/missing"]}>
        <AppRouter />
      </MemoryRouter>,
    );

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
