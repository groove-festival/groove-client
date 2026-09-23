import { fireEvent, render, screen } from "@testing-library/react";

import { ConfirmDialog } from "./ConfirmDialog";

const setup = (over: Partial<Parameters<typeof ConfirmDialog>[0]> = {}) => {
  const onConfirm = vi.fn();
  const onCancel = vi.fn();
  render(
    <ConfirmDialog
      onCancel={onCancel}
      onConfirm={onConfirm}
      open
      title="삭제할까요?"
      {...over}
    />,
  );
  return { onConfirm, onCancel };
};

describe("ConfirmDialog", () => {
  it("renders nothing while closed", () => {
    render(
      <ConfirmDialog onCancel={() => {}} onConfirm={() => {}} open={false} title="x" />,
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("calls onConfirm from the confirm button", () => {
    const { onConfirm } = setup({ confirmLabel: "삭제" });
    fireEvent.click(screen.getByRole("button", { name: "삭제" }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("calls onCancel from the cancel button and Escape", () => {
    const { onCancel } = setup();
    fireEvent.click(screen.getByRole("button", { name: "취소" }));
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onCancel).toHaveBeenCalledTimes(2);
  });
});
