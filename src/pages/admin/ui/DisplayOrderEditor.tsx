import { displayOrderErrorMessage } from "../model/adminErrorMessages";
import { useDisplayOrderDraft } from "../model/useDisplayOrderDraft";

export const DisplayOrderEditor = () => {
  const { data, isSaving, saveError, didSave, workingIds, byId, dirty, move, onSave } =
    useDisplayOrderDraft();

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
                  disabled={index === 0 || isSaving}
                  onClick={() => move(index, -1)}
                  type="button"
                >
                  ↑
                </button>
                <button
                  aria-label="아래로"
                  className="size-7 shrink-0 rounded-md bg-[#3a3a3a] text-xs text-[#fcfcfc] disabled:opacity-40"
                  disabled={index === workingIds.length - 1 || isSaving}
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

      {saveError && (
        <p className="text-xs text-[#ff5b5b]">{displayOrderErrorMessage(saveError)}</p>
      )}
      {didSave && !dirty && (
        <p className="text-xs text-[#00ffff]">순서를 저장했어요.</p>
      )}

      <button
        className="h-10 rounded-lg bg-[#5d00ff] text-xs font-semibold text-[#fcfcfc] disabled:opacity-50"
        disabled={!dirty || isSaving || workingIds.length === 0}
        onClick={onSave}
        type="button"
      >
        순서 저장
      </button>
    </section>
  );
};
