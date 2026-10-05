import { Check, ListFilter } from "lucide-react";
import { useId, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { useDialogLifecycle } from "@/shared/ui";

import { formatTableFilter } from "../model/tableFilter";

interface TableFilterSheetProps {
  onChange: (tables: number[]) => void;

  tableNumbers: number[];
  tables: number[];
}

export const TableFilterSheet = ({
  onChange,
  tableNumbers,
  tables,
}: TableFilterSheetProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState<number[]>(tables);
  const titleId = useId();
  const sheetRef = useRef<HTMLDivElement>(null);
  const isFiltered = tables.length > 0;

  useDialogLifecycle({
    dialogRef: sheetRef,
    open: isOpen,
    onDismiss: () => setIsOpen(false),
  });

  const open = () => {
    setDraft(tables);
    setIsOpen(true);
  };

  const toggle = (table: number) =>
    setDraft((current) =>
      current.includes(table)
        ? current.filter((t) => t !== table)
        : [...current, table],
    );

  const apply = (next: number[]) => {
    onChange(next);
    setIsOpen(false);
  };

  return (
    <>
      <button
        aria-haspopup="dialog"
        className={`flex h-9 shrink-0 items-center gap-1.5 rounded-full px-3 text-xs font-semibold ${
          isFiltered ? "bg-[#00ffff] text-[#0b0b0b]" : "bg-[#262626] text-[#d4d4d4]"
        }`}
        onClick={open}
        type="button"
      >
        <ListFilter aria-hidden="true" size={15} />
        <span className="sr-only">담당 테이블:</span>
        {formatTableFilter(tables)}
      </button>

      {isOpen &&
        createPortal(
          <div
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/60"
            onClick={() => setIsOpen(false)}
          >
            <div
              aria-labelledby={titleId}
              aria-modal="true"
              className="font-pretendard flex max-h-[80dvh] w-full max-w-[600px] flex-col gap-4 rounded-t-2xl bg-[#262626] px-4 pt-5 pb-[calc(1rem+env(safe-area-inset-bottom))] text-[#fcfcfc] outline-none"
              onClick={(event) => event.stopPropagation()}
              ref={sheetRef}
              role="dialog"
              tabIndex={-1}
            >
              <div className="flex flex-col gap-1">
                <p className="text-base font-bold" id={titleId}>
                  담당 테이블
                </p>
                <p className="text-xs text-[#a2a2a2]">
                  고른 테이블의 주문만 보여요. 이 기기에만 저장돼요.
                </p>
              </div>

              {tableNumbers.length === 0 ? (
                <p className="text-sm text-[#7a7a7a]">
                  아직 테이블이 없어요. 주막 설정에서 테이블 개수를 정해 주세요.
                </p>
              ) : (
                <div className="grid grid-cols-5 gap-2 overflow-y-auto">
                  {tableNumbers.map((table) => {
                    const isSelected = draft.includes(table);

                    return (
                      <button
                        aria-label={`${table}번 테이블`}
                        aria-pressed={isSelected}
                        className={`relative flex h-12 items-center justify-center rounded-xl text-base font-bold tabular-nums ${
                          isSelected
                            ? "bg-[#00ffff] text-[#0b0b0b]"
                            : "bg-[#3a3a3a] text-[#fcfcfc]"
                        }`}
                        key={table}
                        onClick={() => toggle(table)}
                        type="button"
                      >
                        {table}
                        {isSelected && (
                          <Check
                            aria-hidden="true"
                            className="absolute top-1 right-1"
                            size={12}
                            strokeWidth={3}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <button
                  className="h-12 rounded-xl bg-[#3a3a3a] text-sm font-semibold"
                  onClick={() => apply([])}
                  type="button"
                >
                  전체 보기
                </button>
                <button
                  className="h-12 rounded-xl bg-[#5d00ff] text-sm font-bold"
                  onClick={() => apply(draft)}
                  type="button"
                >
                  {draft.length === 0 ? "전체로 적용" : `${draft.length}개 테이블 적용`}
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
};
