import { useRef } from "react";

import { type BoothMenuItem } from "@/entities/booth";

import { menuCategoryLabels } from "../model/menuDraft";
import { pubImageAccept } from "../model/pubImageFile";

export interface PubMenuRowProps {
  isPending: boolean;
  menu: BoothMenuItem;
  onDelete: (menu: BoothMenuItem) => void;
  onEdit: (menu: BoothMenuItem) => void;
  onPickImage: (menu: BoothMenuItem, file: File) => void;
  onToggleSoldOut: (menu: BoothMenuItem) => void;
}

export const PubMenuRow = ({
  isPending,
  menu,
  onDelete,
  onEdit,
  onPickImage,
  onToggleSoldOut,
}: PubMenuRowProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    // 같은 파일을 다시 고를 수 있도록 값을 비운다.
    event.target.value = "";

    if (file) {
      onPickImage(menu, file);
    }
  };

  return (
    <li className="flex flex-col gap-2 rounded-xl bg-[#323232] p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 flex-col gap-1">
          <div className="flex items-center gap-1.5">
            <span className="truncate text-sm font-semibold text-[#fcfcfc]">
              {menu.name}
            </span>
            <span className="shrink-0 rounded bg-[#4a4a4a] px-1.5 py-0.5 text-[10px] text-[#d4d4d4]">
              {menuCategoryLabels[menu.category]}
            </span>
            {menu.separateCharge && (
              <span className="shrink-0 rounded bg-[#4a4a4a] px-1.5 py-0.5 text-[10px] text-[#d4d4d4]">
                상차림비
              </span>
            )}
            {menu.isSoldOut && (
              <span className="shrink-0 rounded bg-[#ff5b5b] px-1.5 py-0.5 text-[10px] font-semibold text-[#fcfcfc]">
                품절
              </span>
            )}
          </div>
          {menu.description && (
            <p className="truncate text-xs text-[#a2a2a2]">{menu.description}</p>
          )}
        </div>
        <p className="shrink-0 text-sm font-semibold text-[#fcfcfc]">
          {menu.price.toLocaleString("ko-KR")}원
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          className={`h-8 rounded-lg px-3 text-xs font-semibold disabled:opacity-60 ${
            menu.isSoldOut
              ? "bg-[#5d00ff] text-[#fcfcfc]"
              : "bg-[#4a4a4a] text-[#d4d4d4]"
          }`}
          disabled={isPending}
          onClick={() => onToggleSoldOut(menu)}
          type="button"
        >
          {menu.isSoldOut ? "판매 재개" : "품절 처리"}
        </button>
        <button
          className="h-8 rounded-lg bg-[#4a4a4a] px-3 text-xs font-semibold text-[#d4d4d4] disabled:opacity-60"
          disabled={isPending}
          onClick={() => onEdit(menu)}
          type="button"
        >
          수정
        </button>
        <button
          className="h-8 rounded-lg bg-[#4a4a4a] px-3 text-xs font-semibold text-[#d4d4d4] disabled:opacity-60"
          disabled={isPending}
          onClick={() => fileInputRef.current?.click()}
          type="button"
        >
          {menu.imageUrl ? "사진 교체" : "사진 등록"}
        </button>
        <button
          className="h-8 rounded-lg bg-[#4a4a4a] px-3 text-xs font-semibold text-[#ff8b8b] disabled:opacity-60"
          disabled={isPending}
          onClick={() => onDelete(menu)}
          type="button"
        >
          삭제
        </button>
      </div>

      <input
        accept={pubImageAccept}
        aria-label={`${menu.name} 사진 선택`}
        className="hidden"
        onChange={onFileChange}
        ref={fileInputRef}
        type="file"
      />
    </li>
  );
};
