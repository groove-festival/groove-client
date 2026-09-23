import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";

import ComingSoonPage from "./ComingSoonPage";

describe("ComingSoonPage", () => {
  it("renders the preparing message", () => {
    render(
      <MemoryRouter>
        <ComingSoonPage />
      </MemoryRouter>,
    );

    expect(screen.getByText("페이지 준비중입니다")).toBeInTheDocument();
  });
});
