import { useMemo, useState } from "react";

import { useChangeDisplayOrder } from "../api/changeDisplayOrder";
import { useSongRequests } from "../api/getSongRequests";
import { areOrdersEqual, moveByOffset, sortByDisplayOrder } from "./displayOrder";

// 서버의 선정 목록을 기준으로 공개 순서의 임시 편집 상태를 관리한다.
export function useDisplayOrderDraft() {
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

  // 선정 목록의 구성이나 개수가 달라지면 기존 임시 편집을 사용하지 않는다.
  const localUsable =
    localIds != null &&
    localIds.length === sortedIds.length &&
    localIds.every((id) => byId.has(id));
  const workingIds = localUsable ? localIds : sortedIds;
  const dirty = localUsable && !areOrdersEqual(localIds, sortedIds);

  const move = (index: number, delta: number) => {
    setLocalIds(moveByOffset(workingIds, index, delta));
  };

  const onSave = () => {
    save.mutate(workingIds, {
      onSuccess: () => setLocalIds(null),
      onError: () => void refetch(),
    });
  };

  return {
    data,
    isSaving: save.isPending,
    saveError: save.error,
    didSave: save.isSuccess,
    workingIds,
    byId,
    dirty,
    move,
    onSave,
  };
}
