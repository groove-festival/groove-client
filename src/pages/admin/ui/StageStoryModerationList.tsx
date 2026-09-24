import { useState } from "react";

import { useAdminStories } from "../api/getAdminStories";
import { useDeleteStory } from "../api/deleteStory";
import { deleteStoryErrorMessage } from "../model/adminErrorMessages";
import { ConfirmDialog } from "./ConfirmDialog";

export function StageStoryModerationList() {
  const stories = useAdminStories();
  const deleteStory = useDeleteStory();
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);

  const onConfirmDelete = () => {
    if (pendingDeleteId === null) return;
    const storyId = pendingDeleteId;
    setPendingDeleteId(null);
    deleteStory.mutate(storyId);
  };

  return (
    <section className="flex flex-col gap-3 rounded-2xl bg-[#262626] p-4">
      <h2 className="text-sm font-bold text-[#fcfcfc]">사연 관리</h2>

      {stories.isPending && (
        <p className="text-xs text-[#a2a2a2]">사연 목록을 불러오는 중…</p>
      )}
      {stories.isError && (
        <p className="text-xs text-[#a2a2a2]">사연 목록을 불러오지 못했어요.</p>
      )}
      {deleteStory.isError && (
        <p className="text-xs text-[#ff5b5b]">
          {deleteStoryErrorMessage(deleteStory.error)}
        </p>
      )}

      {stories.data && stories.data.length === 0 && (
        <p className="text-xs text-[#a2a2a2]">접수된 사연이 없어요.</p>
      )}

      {stories.data && stories.data.length > 0 && (
        <div className="flex flex-col gap-2">
          {stories.data.map((story) => (
            <div
              className="flex flex-col gap-1 rounded-lg bg-[#3a3a3a] p-3"
              key={story.storySubmissionId}
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-[#fcfcfc]">{story.title}</p>
                <button
                  className="h-7 rounded-lg bg-[#4a4a4a] px-3 text-[10px] font-semibold text-[#fcfcfc]"
                  onClick={() => setPendingDeleteId(story.storySubmissionId)}
                  type="button"
                >
                  삭제
                </button>
              </div>
              <p className="text-[10px] text-[#a2a2a2]">
                {story.college} · {story.department} · {story.studentNumber} ·{" "}
                {story.name}
                {story.nickname && ` (${story.nickname})`}
              </p>
              <p className="text-xs whitespace-pre-wrap text-[#fcfcfc]">
                {story.content}
              </p>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        danger
        description="복구할 수 없어요. 정말 삭제할까요?"
        onCancel={() => setPendingDeleteId(null)}
        onConfirm={onConfirmDelete}
        open={pendingDeleteId !== null}
        title="사연을 삭제할까요?"
      />
    </section>
  );
}
