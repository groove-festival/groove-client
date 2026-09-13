import { fireEvent, render, screen } from "@testing-library/react";

import { SongRequestGuideModal } from "./SongRequestGuideModal";

describe("SongRequestGuideModal", () => {
  it("renders nothing while closed", () => {
    render(<SongRequestGuideModal open={false} onClose={() => {}} />);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("shows the guideline dialog while open", () => {
    render(<SongRequestGuideModal open onClose={() => {}} />);

    expect(screen.getByRole("dialog")).toHaveAccessibleName(/신청 유의 사항/);
    expect(screen.getAllByRole("listitem").map((item) => item.textContent)).toEqual([
      "곡 신청은 사전 접수 기간에만 열립니다.",
      "학번당 최대 한 곡만 신청 가능합니다.",
      "새로 신청할 경우 가장 최근에 신청하신 곡으로 갱신됩니다.",
      "신청된 곡 목록은 축제 기간에 확인 가능합니다.",
      "신청 시에는 실제 음원이 있는 곡만 검색해서 선택할 수 있습니다.",
    ]);

    ["사전 접수 기간", "학번", "한 곡", "축제 기간", "실제 음원이 있는 곡"].forEach(
      (text) => {
        expect(screen.getByText(text)).toHaveClass("font-black", "text-[#20f0f0]");
      },
    );
  });

  it("does not focus the confirm button on open", () => {
    render(<SongRequestGuideModal open onClose={() => {}} />);

    expect(screen.getByRole("button", { name: "확인했습니다" })).not.toHaveFocus();
  });

  it("closes on the confirm button", () => {
    const handleClose = vi.fn();
    render(<SongRequestGuideModal open onClose={handleClose} />);

    fireEvent.click(screen.getByRole("button", { name: "확인했습니다" }));

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("restores focus without scrolling after close", () => {
    const previousButton = document.createElement("button");
    document.body.appendChild(previousButton);
    previousButton.focus();
    const focus = vi.spyOn(previousButton, "focus");

    const { rerender } = render(<SongRequestGuideModal open onClose={() => {}} />);

    rerender(<SongRequestGuideModal open={false} onClose={() => {}} />);

    expect(focus).toHaveBeenCalledWith({ preventScroll: true });

    focus.mockRestore();
    previousButton.remove();
  });

  it("closes on Escape", () => {
    const handleClose = vi.fn();
    render(<SongRequestGuideModal open onClose={handleClose} />);

    fireEvent.keyDown(document, { key: "Escape" });

    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
