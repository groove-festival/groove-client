import { render, screen } from "@testing-library/react";

import { HomePage } from "./HomePage";

describe("HomePage", () => {
  it("shows the GROOVE project foundation", () => {
    render(<HomePage />);

    expect(
      screen.getByRole("heading", { name: /축제의 흐름을 한 화면에 담습니다/ }),
    ).toBeInTheDocument();
    expect(screen.getByText("TanStack Query")).toBeInTheDocument();
  });
});
