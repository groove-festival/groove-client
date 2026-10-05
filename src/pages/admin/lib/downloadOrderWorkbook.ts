import { type OrderWorkbookSheet } from "../model/orderWorkbook";

export async function downloadOrderWorkbook(
  sheets: OrderWorkbookSheet[],
  fileName: string,
): Promise<void> {
  const { default: writeXlsxFile } = await import("write-excel-file/browser");

  await writeXlsxFile(
    sheets.map((sheet) => ({
      sheet: sheet.name,
      data: sheet.data,
      columns: sheet.columnWidths.map((width) => ({ width })),
      stickyRowsCount: sheet.hasHeaderRow ? 1 : 0,
    })),
    { fontFamily: "맑은 고딕", fontSize: 11 },
  ).toFile(fileName);
}
