import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";

import CreditsPage from "./CreditsPage";

const renderCredits = () =>
  render(
    <MemoryRouter>
      <CreditsPage />
    </MemoryRouter>,
  );

describe("CreditsPage", () => {
  it("renders the title and part sections", () => {
    renderCredits();

    expect(screen.getByRole("heading", { name: "CREDITS" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "기획" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "프론트엔드" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "디자인" })).toBeInTheDocument();
  });

  it("links filled SNS handles to instagram/github profiles with the @ stripped", () => {
    renderCredits();

    const profileLinks = screen
      .getAllByRole("link")
      .filter((link) =>
        /(instagram|github)\.com/.test(link.getAttribute("href") ?? ""),
      );

    expect(profileLinks.length).toBeGreaterThan(0);
    profileLinks.forEach((link) => {
      expect(link.getAttribute("href")).toMatch(
        /^https:\/\/(instagram|github)\.com\/[^@/]+$/,
      );
    });
  });

  it("keeps unfilled handles as non-linked placeholders", () => {
    renderCredits();

    screen.queryAllByText("아이디").forEach((node) => {
      expect(node.closest("a")).toBeNull();
    });
  });
});
