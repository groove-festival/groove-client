import { type OrderWorkbookSheet } from "../model/orderWorkbook";

// 엑셀 라이브러리는 정산할 때 한 번 쓰는 것이라 관리자 화면 번들에 싣지 않고
// 버튼을 누를 때 불러온다.
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
