import { layoutTableQrPages, tableQrPdfFileName } from "./tableQrSheet";

const label = (tableNumber: number) => ({
  orderUrl: `https://example.test/pub/x/t${tableNumber}`,
  tableNumber,
});

describe("layoutTableQrPages", () => {
  it("fills six labels per page in table-number order, left to right then down", () => {
    const pages = layoutTableQrPages([8, 3, 1, 2, 7, 5, 4, 6].map(label));

    expect(pages).toHaveLength(2);
    expect(pages[0].map((slot) => slot.label.tableNumber)).toEqual([1, 2, 3, 4, 5, 6]);
    expect(pages[0].map((slot) => [slot.column, slot.row])).toEqual([
      [0, 0],
      [1, 0],
      [0, 1],
      [1, 1],
      [0, 2],
      [1, 2],
    ]);
    expect(pages[1].map((slot) => slot.label.tableNumber)).toEqual([7, 8]);
  });

  it("returns no pages when there are no tables", () => {
    expect(layoutTableQrPages([])).toEqual([]);
  });
});

describe("tableQrPdfFileName", () => {
  it("names the file after the pub without characters files cannot hold", () => {
    expect(tableQrPdfFileName("컴퓨터/학부 주막")).toBe(
      "GROOVE_컴퓨터학부 주막_테이블QR.pdf",
    );
  });
});
