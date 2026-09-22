import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";

import { FestivalHeader } from "./FestivalHeader";

const renderHeader = (path = "/") =>
  render(
    <MemoryRouter initialEntries={[path]}>
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

  it("keeps the menu button, home link and top position by default", () => {
    renderHeader();

    expect(screen.getByRole("button", { name: "메뉴 열기" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "GROOVE 홈" })).toHaveAttribute(
      "href",
      "/",
    );
    expect(screen.getByRole("banner").style.top).toBe("");
  });

  it("hides the menu button and home link and offsets below a banner", () => {
    render(
      <MemoryRouter>
        <FestivalHeader isLogoLinked={false} showMenuButton={false} topOffset={46} />
      </MemoryRouter>,
    );

    expect(screen.queryByRole("button", { name: "메뉴 열기" })).not.toBeInTheDocument();
    expect(screen.queryByRole("dialog", { hidden: true })).not.toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.getByRole("img", { name: "GROOVE" })).toBeInTheDocument();
    expect(screen.getByRole("banner")).toHaveStyle({ top: "46px" });
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
    expect(screen.getByRole("link", { name: "BOOTH" })).toHaveAttribute("href", "/pub");
    expect(screen.getByRole("link", { name: "SONG CONTEST" })).toHaveAttribute(
      "href",
      "/contest",
    );
  });

  it("shows the story badge only in the open preview state", () => {
    const open = renderHeader("/contest?phase=open");
    fireEvent.click(screen.getByRole("button", { name: "메뉴 열기" }));
    expect(screen.getByText("사연 모집중")).toBeInTheDocument();
    open.unmount();

    renderHeader("/contest?phase=closed");
    fireEvent.click(screen.getByRole("button", { name: "메뉴 열기" }));
    expect(screen.queryByText("사연 모집중")).not.toBeInTheDocument();
  });
});
