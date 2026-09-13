import { render, screen } from "@testing-library/react";

import { DotSpinner, InteractionLoadingOverlay } from ".";

describe("Spinner", () => {
  it("renders a labeled dot spinner when used directly", () => {
    const { container } = render(<DotSpinner label="로딩 중" />);

    expect(screen.getByRole("status", { name: "로딩 중" })).toBeInTheDocument();
    expect(container.querySelectorAll("span")).toHaveLength(3);
  });

  it("renders the interaction loading overlay as a status", () => {
    render(<InteractionLoadingOverlay label="곡을 검색하는 중입니다" />);

    expect(
      screen.getByRole("status", { name: "곡을 검색하는 중입니다" }),
    ).toBeInTheDocument();
  });
});
