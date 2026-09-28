import { X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { menuCategories, type MenuCategory } from "@/entities/booth";

import {
  emptyMenuDraft,
  emptyMenuOptionDraft,
  getMenuDraftError,
  MAX_MENU_OPTION_LABEL_LENGTH,
  MAX_MENU_OPTIONS,
  type MenuDraft,
  type MenuDraftPayload,
  menuCategoryLabels,
  type MenuOptionDraft,
  toMenuDraftPayload,
} from "../model/menuDraft";

export interface PubMenuFormDialogProps {
  initialDraft?: MenuDraft;
  isPending: boolean;
  onCancel: () => void;
  onSubmit: (payload: MenuDraftPayload) => void;
  title: string;
}

// 메뉴 등록(PUB-A5)과 수정(PUB-A6)이 같은 입력을 받아 한 다이얼로그를 쓴다.
// 사진은 목록 행에서 따로 올린다 (PUB-A12).
//
// 닫힌 상태를 이 안에서 다루지 않는다. 부모가 닫을 때 아예 렌더하지 않으므로
// 고치던 값이 언마운트와 함께 사라지고, 다시 열면 initialDraft로 새로 시작한다.
export const PubMenuFormDialog = ({
  initialDraft,
  isPending,
  onCancel,
  onSubmit,
  title,
}: PubMenuFormDialogProps) => {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const [draft, setDraft] = useState<MenuDraft>(initialDraft ?? emptyMenuDraft);

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    dialogRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onCancel();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus();
    };
  }, [onCancel]);

  const draftError = getMenuDraftError(draft);

  const changeOption = (index: number, change: Partial<MenuOptionDraft>) =>
    setDraft({
      ...draft,
      options: draft.options.map((option, optionIndex) =>
        optionIndex === index ? { ...option, ...change } : option,
      ),
    });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const payload = toMenuDraftPayload(draft);

    if (payload) {
      onSubmit(payload);
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
      onClick={onCancel}
    >
      <div
        aria-labelledby={titleId}
        aria-modal="true"
        className="font-pretendard flex max-h-[calc(100dvh-32px)] w-[320px] max-w-full flex-col gap-4 overflow-y-auto rounded-2xl bg-[#323232] p-5 outline-none"
        onClick={(event) => event.stopPropagation()}
        ref={dialogRef}
        role="dialog"
        tabIndex={-1}
      >
        <p className="text-sm font-semibold text-[#fcfcfc]" id={titleId}>
          {title}
        </p>

        <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-[#a2a2a2]">메뉴 이름</span>
            <input
              className="h-10 rounded-xl bg-[#4a4a4a] px-3 text-sm text-[#fcfcfc] outline-none"
              onChange={(event) => setDraft({ ...draft, name: event.target.value })}
              type="text"
              value={draft.name}
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs text-[#a2a2a2]">분류</span>
            <select
              className="h-10 rounded-xl bg-[#4a4a4a] px-3 text-sm text-[#fcfcfc] outline-none"
              onChange={(event) =>
                setDraft({ ...draft, category: event.target.value as MenuCategory })
              }
              value={draft.category}
            >
              {menuCategories.map((category) => (
                <option key={category} value={category}>
                  {menuCategoryLabels[category]}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs text-[#a2a2a2]">가격 (원)</span>
            <input
              className="h-10 rounded-xl bg-[#4a4a4a] px-3 text-sm text-[#fcfcfc] outline-none"
              inputMode="numeric"
              onChange={(event) => setDraft({ ...draft, price: event.target.value })}
              type="text"
              value={draft.price}
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs text-[#a2a2a2]">구성 설명 (선택)</span>
            <input
              className="h-10 rounded-xl bg-[#4a4a4a] px-3 text-sm text-[#fcfcfc] outline-none"
              onChange={(event) =>
                setDraft({ ...draft, description: event.target.value })
              }
              type="text"
              value={draft.description}
            />
          </label>

          {/* 옵션은 손님이 담은 메뉴 아래에서 체크하는 선택 사항이다. 조건을
              확인할 수 없는 할인("메인 메뉴와 함께 주문 시")도 손님 체크를 믿고
              받으므로, 직원이 주문 내역에서 보고 판단한다. */}
          <fieldset className="flex flex-col gap-2">
            <legend className="text-xs text-[#a2a2a2]">
              옵션 (선택) — 할인은 -1000처럼 입력
            </legend>
            {draft.options.map((option, index) => (
              <div className="flex items-center gap-1.5" key={index}>
                <input
                  aria-label={`옵션 ${index + 1} 이름`}
                  className="h-10 min-w-0 flex-1 rounded-xl bg-[#4a4a4a] px-3 text-sm text-[#fcfcfc] outline-none"
                  maxLength={MAX_MENU_OPTION_LABEL_LENGTH}
                  onChange={(event) =>
                    changeOption(index, { label: event.target.value })
                  }
                  placeholder="불파게티로 변경"
                  type="text"
                  value={option.label}
                />
                <input
                  aria-label={`옵션 ${index + 1} 가격 차이 (원)`}
                  className="h-10 w-[76px] shrink-0 rounded-xl bg-[#4a4a4a] px-3 text-sm text-[#fcfcfc] outline-none"
                  onChange={(event) =>
                    changeOption(index, { priceDelta: event.target.value })
                  }
                  placeholder="1000"
                  type="text"
                  value={option.priceDelta}
                />
                <button
                  aria-label={`옵션 ${index + 1} 삭제`}
                  className="flex size-8 shrink-0 items-center justify-center rounded-lg text-[#a2a2a2]"
                  onClick={() =>
                    setDraft({
                      ...draft,
                      options: draft.options.filter(
                        (_option, optionIndex) => optionIndex !== index,
                      ),
                    })
                  }
                  type="button"
                >
                  <X aria-hidden="true" size={16} />
                </button>
              </div>
            ))}
            {draft.options.length < MAX_MENU_OPTIONS && (
              <button
                className="h-9 rounded-lg border border-dashed border-[#6a6a6a] text-xs font-semibold text-[#d4d4d4]"
                onClick={() =>
                  setDraft({
                    ...draft,
                    options: [...draft.options, emptyMenuOptionDraft],
                  })
                }
                type="button"
              >
                옵션 추가
              </button>
            )}
          </fieldset>

          <label className="flex items-center gap-2">
            <input
              checked={draft.separateCharge}
              className="size-4 accent-[#5d00ff]"
              onChange={(event) =>
                setDraft({ ...draft, separateCharge: event.target.checked })
              }
              type="checkbox"
            />
            <span className="text-xs text-[#d4d4d4]">
              상차림비 — 메뉴 목록과 분리해 보여줘요
            </span>
          </label>

          {draftError && <p className="text-xs text-[#ff8b8b]">{draftError}</p>}

          <div className="flex justify-end gap-2">
            <button
              className="h-9 rounded-lg bg-[#4a4a4a] px-4 text-xs font-semibold text-[#fcfcfc]"
              onClick={onCancel}
              type="button"
            >
              취소
            </button>
            <button
              className="h-9 rounded-lg bg-[#5d00ff] px-4 text-xs font-semibold text-[#fcfcfc] disabled:opacity-60"
              disabled={draftError !== null || isPending}
              type="submit"
            >
              저장
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
};
