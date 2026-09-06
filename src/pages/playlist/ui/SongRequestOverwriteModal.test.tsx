import { fireEvent, render, screen } from "@testing-library/react";

import { SongRequestOverwriteModal } from "./SongRequestOverwriteModal";

describe("SongRequestOverwriteModal", () => {
  it("renders nothing while closed", () => {
    render(
      <SongRequestOverwriteModal
        open={false}
        onCancel={() => {}}
        onConfirm={() => {}}
      />,
    );

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("shows the overwrite prompt while open", () => {
    render(<SongRequestOverwriteModal open onCancel={() => {}} onConfirm={() => {}} />);

    expect(screen.getByRole("dialog")).toHaveAccessibleName(/이미 신청한 곡이 있어요/);
  });

  it("calls onCancel from the 취소 button and Escape", () => {
    const onCancel = vi.fn();
    render(<SongRequestOverwriteModal open onCancel={onCancel} onConfirm={() => {}} />);

    fireEvent.click(screen.getByRole("button", { name: "취소" }));
    fireEvent.keyDown(document, { key: "Escape" });

    expect(onCancel).toHaveBeenCalledTimes(2);
  });

  it("calls onConfirm from the 확인 button", () => {
    const onConfirm = vi.fn();
    render(
      <SongRequestOverwriteModal open onCancel={() => {}} onConfirm={onConfirm} />,
    );

    fireEvent.click(screen.getByRole("button", { name: "확인" }));

    expect(onConfirm).toHaveBeenCalledTimes(1);
  });
});
