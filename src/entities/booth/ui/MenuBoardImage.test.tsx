import { fireEvent, render, screen } from "@testing-library/react";

import { MenuBoardImage } from "./MenuBoardImage";

const loadWithSize = (image: HTMLElement, width: number, height: number) => {
  Object.defineProperty(image, "naturalWidth", { configurable: true, value: width });
  Object.defineProperty(image, "naturalHeight", { configurable: true, value: height });
  fireEvent.load(image);
};

describe("MenuBoardImage", () => {
  it("shows a regular menu board whole, without cropping or a fold", () => {
    render(<MenuBoardImage alt="메뉴판" src="/board.jpg" />);
    const image = screen.getByAltText("메뉴판");

    loadWithSize(image, 1000, 1400);

    expect(image).not.toHaveClass("object-cover");
    expect(
      screen.queryByRole("button", { name: /메뉴판 전체 보기/ }),
    ).not.toBeInTheDocument();
  });

  it("folds a stacked multi-board image behind an explicit toggle", () => {
    render(<MenuBoardImage alt="메뉴판" src="/boards.jpg" />);
    const image = screen.getByAltText("메뉴판");

    loadWithSize(image, 1080, 4597);

    expect(image).toHaveClass("object-top");
    fireEvent.click(screen.getByRole("button", { name: /메뉴판 전체 보기/ }));

    expect(image).not.toHaveClass("object-cover");
    expect(screen.getByRole("button", { name: /메뉴판 접기/ })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
  });
});
