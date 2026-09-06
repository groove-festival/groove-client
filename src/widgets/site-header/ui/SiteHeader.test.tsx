import { render, screen } from "@testing-library/react";

import { SiteHeader } from "./SiteHeader";

describe("SiteHeader", () => {
  it("renders the menu button and the home link", () => {
    render(<SiteHeader />);

    expect(screen.getByRole("button", { name: "메뉴 열기" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "GROOVE 홈" })).toBeInTheDocument();
  });

  it("merges the positioning class onto the bar", () => {
    render(<SiteHeader className="left-[-4px]" />);

    expect(screen.getByRole("banner").className).toContain("left-[-4px]");
  });
});
