import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";

import BoothListPage from "./BoothListPage";

const renderPage = () =>
  render(
    <MemoryRouter>
      <BoothListPage />
    </MemoryRouter>,
  );

describe("BoothListPage", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("renders all 22 confirmed booths with placeholder names", () => {
    renderPage();

    fireEvent.click(screen.getByRole("button", { name: "확인했습니다" }));

    expect(screen.getAllByTestId("booth-card")).toHaveLength(22);
    expect(screen.getAllByText("부스 이름")).toHaveLength(22);
    expect(screen.getAllByTestId("booth-card")[0]).toHaveAttribute(
      "href",
      "/pub/electronics-eh",
    );
  });

  it("opens the selected booth detail route", () => {
    render(
      <MemoryRouter initialEntries={["/pub"]}>
        <Routes>
          <Route path="/pub" element={<BoothListPage />} />
          <Route path="/pub/:boothId" element={<div>주막 상세</div>} />
        </Routes>
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole("button", { name: "확인했습니다" }));
    fireEvent.click(screen.getAllByTestId("booth-card")[0]);

    expect(screen.getByText("주막 상세")).toBeInTheDocument();
  });

  it("filters union booths without duplicating the reusable booth card", () => {
    renderPage();

    fireEvent.click(screen.getByRole("button", { name: "확인했습니다" }));
    fireEvent.click(screen.getByRole("button", { name: "전체" }));
    fireEvent.click(screen.getByRole("option", { name: "연합" }));

    expect(screen.getAllByTestId("booth-card")).toHaveLength(4);
    expect(screen.getByText("전자공학부B • 디자인")).toBeInTheDocument();
    expect(screen.getByText("전자공학부A • 음악학과")).toBeInTheDocument();
    expect(screen.getByText("모바일공학전공 • 사회복지학부")).toBeInTheDocument();
    expect(screen.getByText("전기공학과 • 사회학과")).toBeInTheDocument();
  });

  it.each([
    ["IT대학", 9],
    ["간호대학", 1],
    ["예술대학", 3],
    ["사회과학대학", 4],
    ["사범대학", 5],
    ["자연과학대학", 4],
  ])("renders the confirmed %s booth count", (filterLabel, expectedCount) => {
    renderPage();

    fireEvent.click(screen.getByRole("button", { name: "확인했습니다" }));
    fireEvent.click(screen.getByRole("button", { name: "전체" }));
    fireEvent.click(screen.getByRole("option", { name: filterLabel }));

    expect(screen.getAllByTestId("booth-card")).toHaveLength(expectedCount);
  });

  it("keeps a permanently dismissed notice closed on the next render", () => {
    const firstRender = renderPage();

    fireEvent.click(screen.getByRole("button", { name: "다시 보지 않기" }));
    firstRender.unmount();
    renderPage();

    expect(
      screen.queryByRole("heading", { name: "주막 이용 안내 사항" }),
    ).not.toBeInTheDocument();
  });
});
