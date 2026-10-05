import { fireEvent, render, screen } from "@testing-library/react";
import { useRef } from "react";

import { useBodyScrollLock, useDialogLifecycle } from "./useDialogLifecycle";

interface FixtureDialogProps {
  name: string;
  onClose: () => void;
}
const FixtureDialog = ({ name, onClose }: FixtureDialogProps) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  useDialogLifecycle({ dialogRef, onDismiss: onClose });
  return (
    <div aria-label={name} role="dialog" tabIndex={-1} ref={dialogRef}>
      <button>{name} 첫 버튼</button>
      <button disabled tabIndex={0}>
        비활성
      </button>
      <button onClick={onClose}>{name} 닫기</button>
      <button tabIndex={-1}>탭 이동 제외</button>
    </div>
  );
};
const BlockingOverlay = () => {
  useBodyScrollLock();
  return <div role="status">조회 중</div>;
};

describe("dialog lifecycle", () => {
  it("traps Tab and Shift+Tab and restores focus and scroll on close", () => {
    document.body.style.overflow = "auto";
    const trigger = document.createElement("button");
    document.body.appendChild(trigger);
    trigger.focus();
    const onClose = vi.fn();
    const view = render(<FixtureDialog name="안내" onClose={onClose} />);
    expect(screen.getByRole("dialog")).toHaveFocus();
    expect(document.body.style.overflow).toBe("hidden");
    fireEvent.keyDown(document, { key: "Tab" });
    expect(screen.getByRole("button", { name: "안내 첫 버튼" })).toHaveFocus();
    fireEvent.keyDown(document, { key: "Tab", shiftKey: true });
    expect(screen.getByRole("button", { name: "안내 닫기" })).toHaveFocus();
    fireEvent.keyDown(document, { key: "Tab" });
    expect(screen.getByRole("button", { name: "안내 첫 버튼" })).toHaveFocus();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledOnce();
    view.unmount();
    expect(trigger).toHaveFocus();
    expect(document.body.style.overflow).toBe("auto");
    trigger.remove();
    document.body.style.overflow = "";
  });

  it("closes only the top dialog and keeps scroll locked for the remaining dialog", () => {
    const outerClose = vi.fn();
    const innerClose = vi.fn();
    const view = render(
      <>
        <FixtureDialog name="바깥" onClose={outerClose} />
        <FixtureDialog name="안쪽" onClose={innerClose} />
      </>,
    );
    fireEvent.keyDown(document, { key: "Escape" });
    expect(innerClose).toHaveBeenCalledOnce();
    expect(outerClose).not.toHaveBeenCalled();
    view.rerender(<FixtureDialog name="바깥" onClose={outerClose} />);
    expect(document.body.style.overflow).toBe("hidden");
    expect(screen.getByRole("dialog", { name: "바깥" })).toHaveFocus();
    view.unmount();
    expect(document.body.style.overflow).toBe("");
  });

  it("does not reset focus when the dismissal callback changes", () => {
    const first = vi.fn();
    const second = vi.fn();
    const view = render(<FixtureDialog name="안내" onClose={first} />);
    const button = screen.getByRole("button", { name: "안내 첫 버튼" });
    button.focus();
    view.rerender(<FixtureDialog name="안내" onClose={second} />);
    expect(button).toHaveFocus();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledOnce();
  });

  it("keeps programmatic focus inside the dialog", () => {
    const outside = document.createElement("button");
    document.body.appendChild(outside);
    render(<FixtureDialog name="안내" onClose={vi.fn()} />);
    outside.focus();
    expect(screen.getByRole("button", { name: "안내 첫 버튼" })).toHaveFocus();
    outside.remove();
  });

  it("retains the scroll lock when a blocking overlay closes before a dialog", () => {
    const view = render(
      <>
        <BlockingOverlay />
        <FixtureDialog name="안내" onClose={vi.fn()} />
      </>,
    );
    view.rerender(<FixtureDialog name="안내" onClose={vi.fn()} />);
    expect(document.body.style.overflow).toBe("hidden");
    view.unmount();
    expect(document.body.style.overflow).toBe("");
  });
});
