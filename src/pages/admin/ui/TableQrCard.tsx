import { QRCodeSVG } from "qrcode.react";

import { type AdminTable } from "../api/getAdminTables";

export interface TableQrCardProps {
  orderUrl: string;
  table: AdminTable;
}

export const TableQrCard = ({ orderUrl, table }: TableQrCardProps) => (
  <li className="flex break-inside-avoid flex-col items-center gap-2 rounded-xl bg-[#fcfcfc] p-3">
    <span className="text-sm font-bold text-[#1c1c1c]">
      {table.tableNumber}번 테이블
    </span>
    <QRCodeSVG level="M" size={128} value={orderUrl} />
    <span className="w-full text-center text-[10px] break-all text-[#4a4a4a]">
      {orderUrl}
    </span>
  </li>
);
