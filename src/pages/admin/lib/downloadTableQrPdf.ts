import { QRCodeSVG } from "qrcode.react";
import { createElement } from "react";

import {
  layoutTableQrPages,
  QR_LABEL_COLUMNS,
  QR_LABEL_ROWS,
  type TableQrLabel,
  tableQrPdfFileName,
} from "../model/tableQrSheet";

// A4를 150dpi로 그린다. QR 한 칸(모듈)이 10px 넘게 나와 인쇄해도 번지지 않는다.
const PAGE_WIDTH_MM = 210;
const PAGE_HEIGHT_MM = 297;
const PAGE_WIDTH_PX = 1240;
const PAGE_HEIGHT_PX = 1754;
const QR_SIZE_PX = 340;
const FONT_FAMILY = "Pretendard, 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif";

// 화면에 이미 쓰는 qrcode.react로 SVG를 만들고 이미지로 읽는다. 같은 QR 생성기를
// 쓰므로 화면의 QR과 인쇄물의 QR이 어긋날 일이 없다.
const loadQrImage = async (value: string): Promise<HTMLImageElement> => {
  const { renderToStaticMarkup } = await import("react-dom/server");
  // 이미지로 읽는 SVG는 xmlns가 없으면 디코딩되지 않는데, React는 이를 붙이지
  // 않는다.
  const markup = renderToStaticMarkup(
    createElement(QRCodeSVG, {
      level: "M",
      marginSize: 0,
      size: QR_SIZE_PX,
      value,
      xmlns: "http://www.w3.org/2000/svg",
    }),
  );
  const image = new Image();
  image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(markup)}`;
  await image.decode();

  return image;
};

const drawLabel = (
  context: CanvasRenderingContext2D,
  pubName: string,
  label: TableQrLabel,
  qr: HTMLImageElement,
  left: number,
  top: number,
  width: number,
) => {
  const centerX = left + width / 2;

  context.fillStyle = "#1c1c1c";
  context.textAlign = "center";
  context.textBaseline = "alphabetic";

  context.font = `600 26px ${FONT_FAMILY}`;
  context.fillText(pubName, centerX, top + 70, width - 60);

  context.font = `800 64px ${FONT_FAMILY}`;
  context.fillText(`${label.tableNumber}번 테이블`, centerX, top + 145);

  context.drawImage(qr, centerX - QR_SIZE_PX / 2, top + 175, QR_SIZE_PX, QR_SIZE_PX);

  context.font = `600 26px ${FONT_FAMILY}`;
  context.fillText("카메라로 QR을 찍어 주문해 주세요", centerX, top + 560);
};

const drawCutLines = (context: CanvasRenderingContext2D) => {
  context.save();
  context.strokeStyle = "#b4b4b4";
  context.lineWidth = 2;
  context.setLineDash([14, 10]);
  context.beginPath();

  for (let column = 1; column < QR_LABEL_COLUMNS; column += 1) {
    const x = (PAGE_WIDTH_PX / QR_LABEL_COLUMNS) * column;
    context.moveTo(x, 0);
    context.lineTo(x, PAGE_HEIGHT_PX);
  }

  for (let row = 1; row < QR_LABEL_ROWS; row += 1) {
    const y = (PAGE_HEIGHT_PX / QR_LABEL_ROWS) * row;
    context.moveTo(0, y);
    context.lineTo(PAGE_WIDTH_PX, y);
  }

  context.stroke();
  context.restore();
};

// 테이블마다 붙일 QR을 A4 PDF로 내려받는다. 텍스트는 캔버스에 그려 이미지로
// 싣는다 — jsPDF에 한글 글꼴을 넣으면 파일이 수 MB가 되고, 캔버스는 기기에
// 있는 글꼴로 한글을 그린다. 라이브러리는 버튼을 누를 때 불러온다.
export async function downloadTableQrPdf(
  pubName: string,
  labels: TableQrLabel[],
): Promise<void> {
  const [{ jsPDF }] = await Promise.all([import("jspdf"), document.fonts.ready]);
  const pdf = new jsPDF({ format: "a4", orientation: "portrait", unit: "mm" });
  const canvas = document.createElement("canvas");
  canvas.width = PAGE_WIDTH_PX;
  canvas.height = PAGE_HEIGHT_PX;
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("canvas 2d context unavailable");
  }

  const labelWidth = PAGE_WIDTH_PX / QR_LABEL_COLUMNS;
  const labelHeight = PAGE_HEIGHT_PX / QR_LABEL_ROWS;
  const pages = layoutTableQrPages(labels);

  for (const [pageIndex, slots] of pages.entries()) {
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, PAGE_WIDTH_PX, PAGE_HEIGHT_PX);
    drawCutLines(context);

    const qrImages = await Promise.all(
      slots.map((slot) => loadQrImage(slot.label.orderUrl)),
    );

    slots.forEach((slot, index) => {
      const top = slot.row * labelHeight + (labelHeight - 600) / 2;
      drawLabel(
        context,
        pubName,
        slot.label,
        qrImages[index],
        slot.column * labelWidth,
        top,
        labelWidth,
      );
    });

    if (pageIndex > 0) {
      pdf.addPage();
    }
    // 흑백 선화라 무손실 압축이 잘 먹는다. 압축을 끄면 A4 한 장이 6MB를 넘는다.
    pdf.addImage(
      canvas.toDataURL("image/png"),
      "PNG",
      0,
      0,
      PAGE_WIDTH_MM,
      PAGE_HEIGHT_MM,
      undefined,
      "FAST",
    );
  }

  pdf.save(tableQrPdfFileName(pubName));
}
