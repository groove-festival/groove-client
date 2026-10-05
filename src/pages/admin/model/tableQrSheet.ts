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
