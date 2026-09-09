import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";

import { FestivalHeader } from "./FestivalHeader";

const renderHeader = () =>
  render(
    <MemoryRouter>
      <FestivalHeader />
    </MemoryRouter>,
  );

describe("FestivalHeader", () => {
  it("opens and closes the full-screen menu", () => {
    renderHeader();

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "메뉴 열기" }));
    expect(screen.getByRole("dialog", { name: "전체 메뉴" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "메뉴 닫기" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("links each menu item to its destination", () => {
    renderHeader();
    fireEvent.click(screen.getByRole("button", { name: "메뉴 열기" }));

    expect(screen.getByRole("link", { name: "HOME" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "GROOVE PLAYLIST" })).toHaveAttribute(
      "href",
      "/playlist",
    );
    expect(screen.getByRole("link", { name: "CREDITS" })).toHaveAttribute(
      "href",
      "/credits",
    );
    expect(screen.getByRole("link", { name: "BOOTH" })).toHaveAttribute(
      "href",
      "/coming-soon",
    );
  });
});
