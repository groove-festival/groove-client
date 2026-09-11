import { useMemo, useState } from "react";

import { ApiError } from "@/shared/api";

import { useChangeDisplayOrder } from "../api/changeDisplayOrder";
import { useSongRequests } from "../api/getSongRequests";
import { moveByOffset, sortByDisplayOrder } from "../model/displayOrder";

const saveErrorMessage = (error: unknown): string => {
  if (error instanceof ApiError && error.code === "PLST008") {
    return "선정된 곡 전체가 순서에 포함돼야 해요. 목록을 새로고침한 뒤 다시 시도해 주세요.";
  }
  if (error instanceof ApiError && (error.code === "C003" || error.code === "C004")) {
    return "권한이 없어요. 다시 로그인해 주세요.";
  }
  return "순서 저장에 실패했어요. 잠시 후 다시 시도해 주세요.";
};

const sameOrder = (a: readonly number[], b: readonly number[]): boolean =>
  a.length === b.length && a.every((id, index) => id === b[index]);

export const DisplayOrderEditor = () => {
  const { data, refetch } = useSongRequests();
  const save = useChangeDisplayOrder();
  const [localIds, setLocalIds] = useState<number[] | null>(null);

  const selectedSongs = useMemo(
    () =>
      data
        ? data.groups.flatMap((group) => group.songs).filter((song) => song.selected)
        : [],
    [data],
  );
  const sortedIds = useMemo(
    () => sortByDisplayOrder(selectedSongs).map((song) => song.songRequestId),
    [selectedSongs],
  );
  const byId = useMemo(
    () => new Map(selectedSongs.map((song) => [song.songRequestId, song])),
    [selectedSongs],
  );

  // 선정이 바뀌면(개수·구성 불일치) 로컬 편집은 버린다.
  const localUsable =
    localIds != null &&
    localIds.length === sortedIds.length &&
    localIds.every((id) => byId.has(id));
  const workingIds = localUsable ? localIds : sortedIds;
  const dirty = localUsable && !sameOrder(localIds, sortedIds);

  const move = (index: number, delta: number) => {
    setLocalIds(moveByOffset(workingIds, index, delta));
  };

  const onSave = () => {
    save.mutate(workingIds, {
      onSuccess: () => setLocalIds(null),
      onError: () => void refetch(),
    });
  };

  if (!data) {
    return null;
  }

  return (
    <section className="flex flex-col gap-3 rounded-2xl bg-[#262626] p-4">
      <div className="flex items-baseline justify-between">
        <h2 className="text-sm font-bold text-[#fcfcfc]">공개 순서</h2>
        <p className="text-xs text-[#a2a2a2]">선정 {workingIds.length}곡</p>
      </div>

      {workingIds.length === 0 ? (
        <p className="text-xs text-[#767676]">선정된 곡이 없어요.</p>
      ) : (
        <ol className="flex flex-col gap-2">
          {workingIds.map((id, index) => {
            const song = byId.get(id);
            return (
              <li
                className="flex items-center gap-2 rounded-xl bg-[#2b2b2b] p-2"
                key={id}
              >
                <span className="w-5 shrink-0 text-center text-xs font-semibold text-[#00ffff]">
                  {index + 1}
                </span>
                <span className="min-w-0 flex-1 truncate text-xs text-[#fcfcfc]">
                  {song?.title ?? `#${id}`}
                  <span className="text-[#a2a2a2]"> · {song?.nickname}</span>
                </span>
                <button
                  aria-label="위로"
                  className="size-7 shrink-0 rounded-md bg-[#3a3a3a] text-xs text-[#fcfcfc] disabled:opacity-40"
                  disabled={index === 0 || save.isPending}
                  onClick={() => move(index, -1)}
                  type="button"
                >
                  ↑
                </button>
                <button
                  aria-label="아래로"
                  className="size-7 shrink-0 rounded-md bg-[#3a3a3a] text-xs text-[#fcfcfc] disabled:opacity-40"
                  disabled={index === workingIds.length - 1 || save.isPending}
                  onClick={() => move(index, 1)}
                  type="button"
                >
                  ↓
                </button>
              </li>
            );
          })}
        </ol>
      )}

      {save.isError && (
        <p className="text-xs text-[#ff5b5b]">{saveErrorMessage(save.error)}</p>
      )}
      {save.isSuccess && !dirty && (
        <p className="text-xs text-[#00ffff]">순서를 저장했어요.</p>
      )}

      <button
        className="h-10 rounded-lg bg-[#5d00ff] text-xs font-semibold text-[#fcfcfc] disabled:opacity-50"
        disabled={!dirty || save.isPending || workingIds.length === 0}
        onClick={onSave}
        type="button"
      >
        순서 저장
      </button>
    </section>
  );
};
