import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";

import ComingSoonPage from "./ComingSoonPage";

describe("ComingSoonPage", () => {
  it("renders the preparing message and SNS notice", () => {
    render(
      <MemoryRouter>
        <ComingSoonPage />
      </MemoryRouter>,
    );

    expect(screen.getByText("페이지 준비중입니다")).toBeInTheDocument();
    expect(screen.getByText(/공식 SNS에서 확인해 주세요/)).toBeInTheDocument();
  });
});
