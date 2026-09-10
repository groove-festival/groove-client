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
    expect(
      screen.getByText("학번당 최대 한 곡만 신청 가능합니다."),
    ).toBeInTheDocument();
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

  it("closes on Escape", () => {
    const handleClose = vi.fn();
    render(<SongRequestGuideModal open onClose={handleClose} />);

    fireEvent.keyDown(document, { key: "Escape" });

    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
