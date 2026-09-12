interface Orderable {
  displayOrder?: number;
  requestedAt: string;
}

// 선정된 곡을 공개(재생) 순서로 정렬한다. displayOrder가 있는 곡이 그 값 순서로
// 먼저 오고, 아직 순서가 없는 곡은 신청 순(뒤쪽)에 붙는다.
export function sortByDisplayOrder<T extends Orderable>(songs: readonly T[]): T[] {
  return [...songs].sort((a, b) => {
    const ao = a.displayOrder;
    const bo = b.displayOrder;
    if (ao != null && bo != null) {
      return ao - bo;
    }
    if (ao != null) {
      return -1;
    }
    if (bo != null) {
      return 1;
    }
    return a.requestedAt.localeCompare(b.requestedAt);
  });
}

// 배열에서 index 항목을 delta(+1/-1)만큼 이동한 새 배열을 돌려준다. 범위를
// 벗어나면 원본을 그대로 돌려준다.
export function moveByOffset<T>(
  items: readonly T[],
  index: number,
  delta: number,
): T[] {
  const target = index + delta;
  if (index < 0 || index >= items.length || target < 0 || target >= items.length) {
    return [...items];
  }

  const next = [...items];
  const [moved] = next.splice(index, 1);
  next.splice(target, 0, moved);
  return next;
}
