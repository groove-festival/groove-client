import { useCallback, useState } from "react";

import { type BoothMenuItem } from "@/entities/booth";

import { useCreateMenu } from "../api/createMenu";
import { useDeleteMenu } from "../api/deleteMenu";
import { useUpdateMenu } from "../api/updateMenu";
import { useUploadMenuImage } from "../api/uploadMenuImage";
import {
  menuMutationErrorMessage,
  pubImageUploadErrorMessage,
} from "../model/adminErrorMessages";
import {
  type MenuDraft,
  type MenuDraftPayload,
  toMenuDraft,
  toMenuUpdateBody,
} from "../model/menuDraft";
import { getPubImageFileError } from "../model/pubImageFile";
import { ConfirmDialog } from "./ConfirmDialog";
import { PubMenuFormDialog } from "./PubMenuFormDialog";
import { PubMenuRow } from "./PubMenuRow";

export interface PubMenuManagerProps {
  menus: BoothMenuItem[];
}

interface EditTarget {
  draft: MenuDraft;
  menuId: number;
}

// PUB-A5·A6·A7·A12. 손님 화면과 달리 분류별로 묶지 않고 서버가 준 순서 그대로
// 나열한다 — 고칠 메뉴를 찾는 목록이라 묶음이 오히려 방해가 된다.
export const PubMenuManager = ({ menus }: PubMenuManagerProps) => {
  const createMenu = useCreateMenu();
  const updateMenu = useUpdateMenu();
  const deleteMenu = useDeleteMenu();
  const uploadImage = useUploadMenuImage();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<EditTarget | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BoothMenuItem | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const isPending =
    createMenu.isPending ||
    updateMenu.isPending ||
    deleteMenu.isPending ||
    uploadImage.isPending;

  const mutationError = [createMenu.error, updateMenu.error, deleteMenu.error].find(
    Boolean,
  );

  // 다이얼로그의 포커스 effect가 부모 리렌더마다 다시 돌지 않도록 닫기
  // 콜백의 정체성을 고정한다. 입력 중에 포커스를 빼앗기면 글자를 잃는다.
  const closeCreateDialog = useCallback(() => setIsCreateOpen(false), []);
  const closeEditDialog = useCallback(() => setEditTarget(null), []);
  const closeDeleteDialog = useCallback(() => setDeleteTarget(null), []);

  const onToggleSoldOut = (menu: BoothMenuItem) => {
    // 부분 전송이라 품절 여부만 보낸다 (PUB-A6).
    updateMenu.mutate({ menuId: menu.id, requestBody: { soldOut: !menu.isSoldOut } });
  };

  const onPickImage = (menu: BoothMenuItem, file: File) => {
    const error = getPubImageFileError(file);
    setFileError(error);

    if (!error) {
      uploadImage.mutate({ file, menuId: menu.id });
    }
  };

  const onCreate = (payload: MenuDraftPayload) => {
    createMenu.mutate(payload, { onSuccess: () => setIsCreateOpen(false) });
  };

  const onEdit = (payload: MenuDraftPayload) => {
    if (!editTarget) {
      return;
    }

    updateMenu.mutate(
      { menuId: editTarget.menuId, requestBody: toMenuUpdateBody(payload) },
      { onSuccess: () => setEditTarget(null) },
    );
  };

  return (
    <section className="flex flex-col gap-3 rounded-2xl bg-[#262626] p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-1">
          <h2 className="text-sm font-bold text-[#fcfcfc]">메뉴</h2>
          <p className="text-xs text-[#a2a2a2]">
            품절 처리한 메뉴는 손님 화면에서 담기가 막혀요.
          </p>
        </div>
        <button
          className="h-9 shrink-0 rounded-lg bg-[#5d00ff] px-3 text-xs font-semibold text-[#fcfcfc]"
          onClick={() => setIsCreateOpen(true)}
          type="button"
        >
          메뉴 추가
        </button>
      </div>

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
      {mutationError && (
        <p className="rounded-lg bg-[#3a2020] p-2 text-xs text-[#ff8b8b]">
          {menuMutationErrorMessage(mutationError)}
        </p>
      )}

      {menus.length === 0 ? (
        <p className="rounded-xl bg-[#2c2c2c] p-3 text-xs text-[#7a7a7a]">
          등록된 메뉴가 없어요. 메뉴를 등록해야 손님이 주문할 수 있어요.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {menus.map((menu) => (
            <PubMenuRow
              isPending={isPending}
              key={menu.id}
              menu={menu}
              onDelete={setDeleteTarget}
              onEdit={(target) =>
                setEditTarget({ draft: toMenuDraft(target), menuId: target.id })
              }
              onPickImage={onPickImage}
              onToggleSoldOut={onToggleSoldOut}
            />
          ))}
        </ul>
      )}

      {isCreateOpen && (
        <PubMenuFormDialog
          isPending={createMenu.isPending}
          onCancel={closeCreateDialog}
          onSubmit={onCreate}
          title="메뉴 추가"
        />
      )}

      {editTarget && (
        <PubMenuFormDialog
          initialDraft={editTarget.draft}
          isPending={updateMenu.isPending}
          onCancel={closeEditDialog}
          onSubmit={onEdit}
          title="메뉴 수정"
        />
      )}

      <ConfirmDialog
        confirmLabel="삭제"
        danger
        description={
          deleteTarget
            ? `"${deleteTarget.name}"을(를) 삭제해요. 이미 들어온 주문의 표시는 그대로 남아요.`
            : undefined
        }
        onCancel={closeDeleteDialog}
        onConfirm={() => {
          if (deleteTarget) {
            deleteMenu.mutate(deleteTarget.id);
          }
          setDeleteTarget(null);
        }}
        open={deleteTarget !== null}
        title="이 메뉴를 삭제할까요?"
      />
    </section>
  );
};
