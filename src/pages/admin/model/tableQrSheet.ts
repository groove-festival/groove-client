// 테이블 QR 인쇄용 PDF의 배치. A4 한 장에 2열 × 3행으로 6개를 싣는다 —
// 한 칸이 약 10×10cm라 잘라서 테이블에 세우거나 붙이기에 알맞고, QR은
// 5cm 넘게 나와 휴대폰 카메라가 테이블 너머에서도 읽는다.
export const QR_LABEL_COLUMNS = 2;
export const QR_LABEL_ROWS = 3;
export const QR_LABELS_PER_PAGE = QR_LABEL_COLUMNS * QR_LABEL_ROWS;

export interface TableQrLabel {
  orderUrl: string;
  tableNumber: number;
}

export interface TableQrLabelSlot {
  column: number;
  label: TableQrLabel;
  row: number;
}

// 테이블 번호 순으로 정렬해 페이지·칸에 채운다. 인쇄물을 번호 순으로 넘기며
// 붙일 수 있어야 한다.
export const layoutTableQrPages = (labels: TableQrLabel[]): TableQrLabelSlot[][] => {
  const sorted = [...labels].sort(
    (left, right) => left.tableNumber - right.tableNumber,
  );
  const pages: TableQrLabelSlot[][] = [];

  sorted.forEach((label, index) => {
    const slot = index % QR_LABELS_PER_PAGE;

    if (slot === 0) {
      pages.push([]);
    }

    pages[pages.length - 1].push({
      label,
      column: slot % QR_LABEL_COLUMNS,
      row: Math.floor(slot / QR_LABEL_COLUMNS),
    });
  });

  return pages;
};

export const tableQrPdfFileName = (pubName: string): string => {
  const safeName = pubName.replace(/[\\/:*?"<>|]/g, "").trim() || "주막";

  return `GROOVE_${safeName}_테이블QR.pdf`;
};
