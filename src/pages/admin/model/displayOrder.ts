interface Orderable {
  displayOrder?: number;
  requestedAt: string;
}

export function areOrdersEqual(a: readonly number[], b: readonly number[]): boolean {
  return a.length === b.length && a.every((id, index) => id === b[index]);
}

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
