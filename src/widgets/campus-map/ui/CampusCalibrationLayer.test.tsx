import { fireEvent, render, screen } from "@testing-library/react";

import { CampusCalibrationLayer } from "./CampusCalibrationLayer";

describe("CampusCalibrationLayer", () => {
  it("converts a tap inside the transformed map to a ratio point", () => {
    const onSelect = vi.fn();

    render(
      <CampusCalibrationLayer actualPoint={null} isSelecting onSelect={onSelect} />,
    );

    const selector = screen.getByRole("button", {
      name: "지도에서 실제 위치 선택",
    });
    vi.spyOn(selector, "getBoundingClientRect").mockReturnValue({
      bottom: 1328,
      height: 1128,
      left: 100,
      right: 1076,
      top: 200,
      width: 976,
      x: 100,
      y: 200,
      toJSON: () => ({}),
    });

    fireEvent.click(selector, { clientX: 588, clientY: 764, detail: 1 });

    expect(onSelect).toHaveBeenCalledWith({ xRatio: 0.5, yRatio: 0.5 });
  });

  it("shows the selected actual point", () => {
    render(
      <CampusCalibrationLayer
        actualPoint={{ xRatio: 0.25, yRatio: 0.75 }}
        isSelecting={false}
        onSelect={() => {}}
      />,
    );

    expect(screen.getByRole("img", { name: "실제 위치" }).parentElement).toHaveStyle({
      left: "25%",
      top: "75%",
    });
  });
});
