import { useRef, useState } from "react";

import { useUploadMenuBoardImage } from "../api/uploadMenuBoardImage";
import { pubImageUploadErrorMessage } from "../model/adminErrorMessages";
import { getPubImageFileError, pubImageAccept } from "../model/pubImageFile";

export interface PubMenuBoardImageFieldProps {
  menuBoardImageUrl: string | null;
}

// PUB-A4. 주막 전체의 실물 메뉴판을 찍은 1장. 준비중일 때 손님에게 보이는 게
// 이 사진이라 메뉴 등록보다 먼저 올려두는 편이 낫다.
export const PubMenuBoardImageField = ({
  menuBoardImageUrl,
}: PubMenuBoardImageFieldProps) => {
  const uploadImage = useUploadMenuBoardImage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    const error = getPubImageFileError(file);
    setFileError(error);

    if (!error) {
      uploadImage.mutate(file);
    }
  };

  return (
    <section className="flex flex-col gap-3 rounded-2xl bg-[#262626] p-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-sm font-bold text-[#fcfcfc]">메뉴판 사진</h2>
        <p className="text-xs text-[#a2a2a2]">
          실물 메뉴판을 찍은 사진 1장이에요. JPG·PNG·WebP, 10MB 이하.
        </p>
      </div>

      {menuBoardImageUrl && (
        <img
          alt="등록된 메뉴판"
          className="aspect-[3/4] w-full rounded-xl object-cover"
          src={menuBoardImageUrl}
        />
      )}

      <button
        className="h-10 rounded-xl bg-[#3a3a3a] text-sm font-semibold text-[#fcfcfc] disabled:opacity-60"
        disabled={uploadImage.isPending}
        onClick={() => fileInputRef.current?.click()}
        type="button"
      >
        {menuBoardImageUrl ? "사진 교체" : "사진 올리기"}
      </button>

      <input
        accept={pubImageAccept}
        aria-label="메뉴판 사진 선택"
        className="hidden"
        onChange={onFileChange}
        ref={fileInputRef}
        type="file"
      />

      {fileError && (
        <p className="rounded-lg bg-[#3a2020] p-2 text-xs text-[#ff8b8b]">
          {fileError}
        </p>
      )}
      {uploadImage.isError && (
        <p className="rounded-lg bg-[#3a2020] p-2 text-xs text-[#ff8b8b]">
          {pubImageUploadErrorMessage(uploadImage.error)}
        </p>
      )}
    </section>
  );
};
