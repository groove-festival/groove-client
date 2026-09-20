import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";

import BoothDetailPage from "./BoothDetailPage";
import { BoothMenuItemRow } from "./BoothMenuItemRow";

const renderDetailPage = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/pub" element={<div>주막 목록</div>} />
        <Route path="/pub/:boothId" element={<BoothDetailPage />} />
      </Routes>
    </MemoryRouter>,
  );

describe("BoothDetailPage", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("renders the image variant from API-shaped fixture data", () => {
    renderDetailPage("/pub/electronics-eh");

    expect(screen.getByAltText("주막 이름 메뉴판")).toBeInTheDocument();
    expect(screen.getAllByText("메뉴명")).toHaveLength(13);
    expect(screen.getAllByText("가격")).toHaveLength(13);
    expect(screen.getByRole("heading", { name: "세트 메뉴" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "메인 메뉴" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "사이드 메뉴" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "음료" })).toBeInTheDocument();
  });

  it("renders the no-image variant without reserving an image slot", () => {
    renderDetailPage("/pub/electronics-b-design");

    expect(screen.queryByAltText("주막 이름 메뉴판")).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "주막 이름" })).toBeInTheDocument();
  });

  it("keeps a permanently dismissed QR notice closed on later booth visits", () => {
    const firstRender = renderDetailPage("/pub/electronics-eh");

    fireEvent.click(screen.getByRole("button", { name: "다시 보지 않기" }));
    firstRender.unmount();
    renderDetailPage("/pub/electronics-b-design");

    expect(
      screen.queryByRole("heading", { name: "QR 셀프 주문 안내" }),
    ).not.toBeInTheDocument();
  });

  it("redirects an unknown booth id to the booth list", () => {
    renderDetailPage("/pub/not-a-booth");

    expect(screen.getByText("주막 목록")).toBeInTheDocument();
  });
});

describe("BoothMenuItemRow", () => {
  it("formats an API price and gives sold-out state precedence", () => {
    const { rerender } = render(
      <ul>
        <BoothMenuItemRow
          item={{
            id: "menu-1",
            name: "김치전",
            description: "바삭한 김치전",
            price: 15_000,
          }}
        />
      </ul>,
    );

    expect(screen.getByText("15,000원")).toBeInTheDocument();

    rerender(
      <ul>
        <BoothMenuItemRow
          item={{
            id: "menu-1",
            name: "김치전",
            description: "바삭한 김치전",
            price: 15_000,
            isSoldOut: true,
          }}
        />
      </ul>,
    );

    expect(screen.getByText("품절")).toBeInTheDocument();
    expect(screen.queryByText("15,000원")).not.toBeInTheDocument();
  });
});
