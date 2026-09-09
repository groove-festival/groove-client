import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";

import HomePage from "./HomePage";

const renderHomePage = () =>
  render(
    <MemoryRouter>
      <HomePage />
    </MemoryRouter>,
  );

describe("HomePage", () => {
  it("renders the festival song request screen", () => {
    renderHomePage();

    expect(
      screen.getByRole("heading", { name: "GROOVE FESTIVAL" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "노래 신청하기" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "신청하기" })).toBeInTheDocument();
  });

  it("changes the selected college", () => {
    renderHomePage();

    const nursingButton = screen.getByRole("button", { name: "간호" });
    fireEvent.click(nursingButton);

    expect(nursingButton).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "IT" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });
});
