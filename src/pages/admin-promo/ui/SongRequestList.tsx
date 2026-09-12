import { useState } from "react";

import { ApiError } from "@/shared/api";

import { useChangeSelection } from "../api/changeSelection";
import { useDeleteSongRequest } from "../api/deleteSongRequest";
import { type AdminSongRequest, useSongRequests } from "../api/getSongRequests";
import { ConfirmDialog } from "./ConfirmDialog";

const mutationErrorMessage = (error: unknown): string => {
  if (error instanceof ApiError) {
    if (error.code === "PLST002") {
      return "이미 삭제된 신청이에요. 목록을 새로고침해 주세요.";
    }
    if (error.code === "C003" || error.code === "C004") {
      return "권한이 없어요. 다시 로그인해 주세요.";
    }
  }
  return "처리에 실패했어요. 잠시 후 다시 시도해 주세요.";
};

interface SongRequestRowProps {
  song: AdminSongRequest;
  onToggleSelected: (song: AdminSongRequest) => void;
  onDelete: (song: AdminSongRequest) => void;
  busy: boolean;
}

// 부모(SongRequestList)에서만 쓰는 행 컴포넌트. 비공개 정보(본명·학번·학과)는
// 화면에만 노출한다.
const SongRequestRow = ({
  song,
  onToggleSelected,
  onDelete,
  busy,
}: SongRequestRowProps) => {
  return (
    <li className="flex gap-3 rounded-xl bg-[#2b2b2b] p-3">
      {song.albumCoverUrl ? (
        <img
          alt=""
          className="size-12 shrink-0 rounded-lg object-cover"
          src={song.albumCoverUrl}
        />
      ) : (
        <div className="size-12 shrink-0 rounded-lg bg-[#4a4a4a]" />
      )}

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p className="truncate text-sm font-semibold text-[#fcfcfc]">{song.title}</p>
        <p className="truncate text-xs text-[#a2a2a2]">{song.artist}</p>
        <p className="truncate text-xs text-[#a2a2a2]">
          닉네임 {song.nickname}
          {song.selected && song.displayOrder != null && (
            <span className="text-[#00ffff]"> · 공개 순서 {song.displayOrder}</span>
          )}
        </p>
        <p className="text-xs text-[#767676]">
          {song.name} · {song.studentNumber} · {song.department}
        </p>
      </div>

      <div className="flex shrink-0 flex-col items-end gap-2">
        <button
          aria-pressed={song.selected}
          className={`h-8 rounded-lg px-3 text-xs font-semibold disabled:opacity-50 ${
            song.selected
              ? "bg-[#5d00ff] text-[#fcfcfc]"
              : "border border-[#5d5d5d] text-[#fcfcfc]"
          }`}
          disabled={busy}
          onClick={() => onToggleSelected(song)}
          type="button"
        >
          {song.selected ? "선정됨" : "선정"}
        </button>
        <button
          className="h-8 rounded-lg px-3 text-xs font-semibold text-[#ff5b5b] disabled:opacity-50"
          disabled={busy}
          onClick={() => onDelete(song)}
          type="button"
        >
          삭제
        </button>
      </div>
    </li>
  );
};

export const SongRequestList = () => {
  const { data, isPending, isError, refetch } = useSongRequests();
  const changeSelection = useChangeSelection();
  const deleteSong = useDeleteSongRequest();
  const [pendingDelete, setPendingDelete] = useState<AdminSongRequest | null>(null);

  const busy = changeSelection.isPending || deleteSong.isPending;
  const mutationError = changeSelection.error ?? deleteSong.error;

  if (isPending) {
    return <p className="px-1 py-6 text-xs text-[#a2a2a2]">신청 명단을 불러오는 중…</p>;
  }

  if (isError || !data) {
    return (
      <div className="flex flex-col items-start gap-2 px-1 py-6">
        <p className="text-xs text-[#a2a2a2]">신청 명단을 불러오지 못했어요.</p>
        <button
          className="h-8 rounded-lg bg-[#3a3a3a] px-3 text-xs font-semibold text-[#fcfcfc]"
          onClick={() => void refetch()}
          type="button"
        >
          다시 시도
        </button>
      </div>
    );
  }

  const confirmDelete = () => {
    if (!pendingDelete) {
      return;
    }
    const target = pendingDelete;
    setPendingDelete(null);
    deleteSong.mutate(target.songRequestId);
  };

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between">
        <h2 className="text-sm font-bold text-[#fcfcfc]">신청 명단</h2>
        <p className="text-xs text-[#a2a2a2]">
          전체 {data.totalCount} · 선정 {data.selectedCount}
        </p>
      </div>

      {(changeSelection.isError || deleteSong.isError) && (
        <p className="text-xs text-[#ff5b5b]">{mutationErrorMessage(mutationError)}</p>
      )}

      {data.groups.map((group) => (
        <div className="flex flex-col gap-2" key={group.college}>
          <p className="text-xs font-semibold text-[#a2a2a2]">
            {group.collegeName} ({group.count})
          </p>
          {group.songs.length === 0 ? (
            <p className="px-1 text-xs text-[#767676]">신청 없음</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {group.songs.map((song) => (
                <SongRequestRow
                  busy={busy}
                  key={song.songRequestId}
                  onDelete={setPendingDelete}
                  onToggleSelected={(target) =>
                    changeSelection.mutate({
                      songRequestId: target.songRequestId,
                      selected: !target.selected,
                    })
                  }
                  song={song}
                />
              ))}
            </ul>
          )}
        </div>
      ))}

      <ConfirmDialog
        confirmLabel="삭제"
        danger
        description={
          pendingDelete
            ? `"${pendingDelete.title}" (${pendingDelete.nickname}) 신청을 삭제합니다. 되돌릴 수 없어요.`
            : undefined
        }
        onCancel={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
        open={pendingDelete !== null}
        title="신청곡을 삭제할까요?"
      />
    </section>
  );
};
