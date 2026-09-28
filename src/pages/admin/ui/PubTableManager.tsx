import { FileDown } from "lucide-react";
import { useState } from "react";

import { InteractionLoadingOverlay } from "@/shared/ui";

import { useAdminTables } from "../api/getAdminTables";
import { useSetTableCount } from "../api/setTableCount";
import { downloadTableQrPdf } from "../lib/downloadTableQrPdf";
import { tableCountErrorMessage } from "../model/adminErrorMessages";
import { buildTableOrderUrl } from "../model/tableQr";
import { ConfirmDialog } from "./ConfirmDialog";
import { TableQrCard } from "./TableQrCard";

export interface PubTableManagerProps {
  boothCode: string;
  // 인쇄물 라벨에 적는다.
  pubName: string;
}

type PdfState = "idle" | "working" | "failed";

const parseCount = (value: string): number | null => {
  const trimmed = value.trim();

  return /^\d+$/.test(trimmed) ? Number(trimmed) : null;
};

// PUB-A10·A11. 개수를 보내면 서버가 1번부터 그 수만큼 만들고 테이블 코드를
// 랜덤으로 발급한다. 줄이는 요청은 주문이 들어온 테이블을 자를 수 있어
// 확인을 한 번 받는다.
export const PubTableManager = ({ boothCode, pubName }: PubTableManagerProps) => {
  const tables = useAdminTables();
  const setTableCount = useSetTableCount();

  const currentCount = tables.data?.length ?? 0;
  const [draftCount, setDraftCount] = useState("");
  const [isShrinkConfirmOpen, setIsShrinkConfirmOpen] = useState(false);
  const [pdfState, setPdfState] = useState<PdfState>("idle");

  const nextCount = parseCount(draftCount);
  const canSubmit = nextCount !== null && nextCount > 0 && !setTableCount.isPending;

  const submit = (count: number) => {
    setTableCount.mutate(count, { onSuccess: () => setDraftCount("") });
  };

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (nextCount === null || nextCount <= 0) {
      return;
    }

    if (currentCount > 0 && nextCount < currentCount) {
      setIsShrinkConfirmOpen(true);
      return;
    }

    submit(nextCount);
  };

  // origin은 브라우저에서만 읽을 수 있다. 서버 렌더가 없는 앱이라 안전하다.
  const origin = typeof window === "undefined" ? "" : window.location.origin;
  const orderUrlOf = (tableCode: string) =>
    buildTableOrderUrl({ boothCode, origin, tableCode });

  const onDownloadPdf = async () => {
    if (!tables.data) {
      return;
    }

    setPdfState("working");

    try {
      await downloadTableQrPdf(
        pubName,
        tables.data.map((table) => ({
          orderUrl: orderUrlOf(table.tableCode),
          tableNumber: table.tableNumber,
        })),
      );
      setPdfState("idle");
    } catch {
      setPdfState("failed");
    }
  };

  return (
    <section className="flex flex-col gap-3 rounded-2xl bg-[#262626] p-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-sm font-bold text-[#fcfcfc]">테이블 · QR</h2>
        <p className="text-xs text-[#a2a2a2]">
          개수를 정하면 1번부터 그만큼 만들어져요. 인쇄용 PDF를 받아 A4로 뽑은 뒤
          점선대로 잘라 테이블마다 붙여 주세요.
        </p>
      </div>

      <form className="flex items-end gap-2" onSubmit={onSubmit}>
        <label className="flex flex-1 flex-col gap-1">
          <span className="text-xs text-[#a2a2a2]">
            테이블 개수 {currentCount > 0 && `(현재 ${currentCount}개)`}
          </span>
          <input
            className="h-10 rounded-xl bg-[#3a3a3a] px-3 text-sm text-[#fcfcfc] outline-none"
            inputMode="numeric"
            onChange={(event) => setDraftCount(event.target.value)}
            placeholder={currentCount > 0 ? String(currentCount) : "예: 12"}
            type="text"
            value={draftCount}
          />
        </label>
        <button
          className="h-10 shrink-0 rounded-xl bg-[#5d00ff] px-4 text-sm font-semibold text-[#fcfcfc] disabled:opacity-60"
          disabled={!canSubmit}
          type="submit"
        >
          적용
        </button>
      </form>

      {setTableCount.isError && (
        <p className="rounded-lg bg-[#3a2020] p-2 text-xs text-[#ff8b8b]">
          {tableCountErrorMessage(setTableCount.error)}
        </p>
      )}

      {tables.isPending && (
        <p className="text-xs text-[#a2a2a2]">테이블을 불러오는 중…</p>
      )}
      {tables.isError && (
        <p className="text-xs text-[#a2a2a2]">테이블을 불러오지 못했어요.</p>
      )}

      {tables.data && tables.data.length > 0 && (
        <button
          className="flex h-11 items-center justify-center gap-2 rounded-xl bg-[#fcfcfc] text-sm font-bold text-[#1c1c1c] disabled:opacity-60"
          disabled={pdfState === "working"}
          onClick={() => void onDownloadPdf()}
          type="button"
        >
          <FileDown aria-hidden="true" size={18} />
          QR 인쇄용 PDF 받기 ({tables.data.length}개 · A4 한 장에 6개)
        </button>
      )}

      {pdfState === "failed" && (
        <p className="rounded-lg bg-[#3a2020] p-2 text-xs text-[#ff8b8b]">
          PDF를 만들지 못했어요. 잠시 뒤 다시 시도해 주세요.
        </p>
      )}

      {tables.data && tables.data.length > 0 && (
        <ul className="grid grid-cols-2 gap-2">
          {tables.data.map((table) => (
            <TableQrCard
              key={table.tableCode}
              orderUrl={orderUrlOf(table.tableCode)}
              table={table}
            />
          ))}
        </ul>
      )}

      <ConfirmDialog
        confirmLabel="줄이기"
        danger
        description={`${currentCount}개에서 ${nextCount ?? 0}개로 줄여요. 이미 주문이 들어온 테이블이 잘리면 서버가 막아요.`}
        onCancel={() => setIsShrinkConfirmOpen(false)}
        onConfirm={() => {
          if (nextCount !== null) {
            submit(nextCount);
          }
          setIsShrinkConfirmOpen(false);
        }}
        open={isShrinkConfirmOpen}
        title="테이블 개수를 줄일까요?"
      />

      {pdfState === "working" && (
        <InteractionLoadingOverlay label="QR 인쇄용 PDF를 만드는 중입니다" />
      )}
    </section>
  );
};
