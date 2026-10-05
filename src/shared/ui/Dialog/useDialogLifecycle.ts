import { useEffect, useRef, type RefObject } from "react";

let scrollLockCount = 0;
let originalOverflow = "";
const dialogs: HTMLElement[] = [];

const lockBodyScroll = () => {
  if (scrollLockCount === 0) originalOverflow = document.body.style.overflow;
  scrollLockCount += 1;
  document.body.style.overflow = "hidden";
  return () => {
    scrollLockCount -= 1;
    if (scrollLockCount === 0) document.body.style.overflow = originalOverflow;
  };
};

export const useBodyScrollLock = (enabled = true): void => {
  useEffect(() => (enabled ? lockBodyScroll() : undefined), [enabled]);
};

const focusableElements = (dialog: HTMLElement): HTMLElement[] =>
  Array.from(
    dialog.querySelectorAll<HTMLElement>(
      'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), iframe, [tabindex]:not([tabindex="-1"])',
    ),
  ).filter(
    (element) =>
      element.tabIndex >= 0 &&
      !element.matches(":disabled") &&
      !element.closest('[hidden], [inert], [aria-hidden="true"]') &&
      window.getComputedStyle(element).display !== "none" &&
      window.getComputedStyle(element).visibility !== "hidden",
  );

interface UseDialogLifecycleArgs {
  dialogRef: RefObject<HTMLElement | null>;
  open?: boolean;
  onDismiss?: () => void;
}

export const useDialogLifecycle = ({
  dialogRef,
  open = true,
  onDismiss,
}: UseDialogLifecycleArgs): void => {
  const onDismissRef = useRef(onDismiss);
  useEffect(() => {
    onDismissRef.current = onDismiss;
  }, [onDismiss]);
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!open || !dialog) return;
    const previouslyFocused =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const unlockScroll = lockBodyScroll();
    dialogs.push(dialog);
    dialog.focus({ preventScroll: true });
    const isTopDialog = () => dialogs.at(-1) === dialog;
    const focusInside = () =>
      (focusableElements(dialog)[0] ?? dialog).focus({ preventScroll: true });
    const onFocus = (event: FocusEvent) => {
      if (
        isTopDialog() &&
        event.target instanceof Node &&
        !dialog.contains(event.target)
      )
        focusInside();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (!isTopDialog()) return;
      if (event.key === "Escape" && onDismissRef.current) {
        event.preventDefault();
        event.stopPropagation();
        onDismissRef.current();
      }
      if (event.key !== "Tab") return;
      const elements = focusableElements(dialog);
      const first = elements[0];
      const last = elements.at(-1);
      if (!first || !last) {
        event.preventDefault();
        dialog.focus();
      } else if (
        event.shiftKey &&
        (document.activeElement === first || document.activeElement === dialog)
      ) {
        event.preventDefault();
        last.focus();
      } else if (
        !event.shiftKey &&
        (document.activeElement === last || document.activeElement === dialog)
      ) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("focusin", onFocus);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("focusin", onFocus);
      const wasTopDialog = isTopDialog();
      const index = dialogs.indexOf(dialog);
      if (index !== -1) dialogs.splice(index, 1);
      unlockScroll();
      if (!wasTopDialog) return;
      const parent = dialogs.at(-1);
      if (
        previouslyFocused?.isConnected &&
        (!parent || parent.contains(previouslyFocused))
      ) {
        previouslyFocused.focus({ preventScroll: true });
      } else {
        parent?.focus({ preventScroll: true });
      }
    };
  }, [dialogRef, open]);
};
