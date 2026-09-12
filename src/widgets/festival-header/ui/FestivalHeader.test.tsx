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
  it("merges the extra class onto the header bar", () => {
    render(
      <MemoryRouter>
        <FestivalHeader className="left-[-4px]" />
      </MemoryRouter>,
    );

    expect(screen.getByRole("banner").className).toContain("left-[-4px]");
  });

  it("opens and closes the full-screen menu", () => {
    renderHeader();

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "메뉴 열기" }));
    expect(screen.getByRole("dialog", { name: "전체 메뉴" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "메뉴 닫기" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("places the menu over the mobile app frame", () => {
    renderHeader();

    fireEvent.click(screen.getByRole("button", { name: "메뉴 열기" }));

    expect(screen.getByRole("dialog", { name: "전체 메뉴" })).toHaveClass(
      "left-1/2",
      "max-w-[600px]",
      "-translate-x-1/2",
    );
  });

  it("slides the menu panel in smoothly", () => {
    renderHeader();

    fireEvent.click(screen.getByRole("button", { name: "메뉴 열기" }));

    expect(
      screen.getByRole("dialog", { name: "전체 메뉴" }).firstElementChild,
    ).toHaveClass("transition-transform", "duration-300", "ease-out", "translate-x-0");
  });

  it("links each menu item to its destination", () => {
    renderHeader();
    fireEvent.click(screen.getByRole("button", { name: "메뉴 열기" }));

    expect(screen.getByRole("link", { name: "HOME" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "GROOVE PLAYLIST" })).toHaveAttribute(
      "href",
      "/",
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
