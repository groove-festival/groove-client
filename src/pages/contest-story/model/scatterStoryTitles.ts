export interface StoryTitleSize {
  width: number;
  height: number;
  seed: number;
}

export interface StoryTitlePlacement {
  left: number;
  top: number;
  width: number;
  height: number;
}

const edge = 8;
const gap = 18;
const defaultMinHeight = 336;

function seededRandom(seed: number): () => number {
  let value = seed >>> 0;

  return () => {
    value += 0x6d2b79f5;
    let next = value;
    next = Math.imul(next ^ (next >>> 15), next | 1);
    next ^= next + Math.imul(next ^ (next >>> 7), next | 61);
    return ((next ^ (next >>> 14)) >>> 0) / 4_294_967_296;
  };
}

function overlaps(
  candidate: StoryTitlePlacement,
  placed: StoryTitlePlacement,
): boolean {
  return (
    candidate.left < placed.left + placed.width + gap &&
    candidate.left + candidate.width + gap > placed.left &&
    candidate.top < placed.top + placed.height + gap &&
    candidate.top + candidate.height + gap > placed.top
  );
}

export function scatterStoryTitles(
  sizes: StoryTitleSize[],
  containerWidth: number,
  minimumHeight = defaultMinHeight,
): { placements: StoryTitlePlacement[]; height: number } {
  const width = Math.max(1, Math.floor(containerWidth));
  const availableWidth = Math.max(1, width - edge * 2);
  const items = sizes.map((size, index) => ({
    height: Math.max(size.height, 1),
    index,
    seed: size.seed,
    width: Math.min(Math.max(size.width, 1), availableWidth),
  }));
  const totalArea = items.reduce(
    (sum, item) => sum + (item.width + gap) * (item.height + gap),
    0,
  );
  let height = Math.max(
    defaultMinHeight,
    Math.floor(minimumHeight),
    Math.ceil(totalArea / (width * 0.68)),
  );
  const packingOrder = [...items].sort(
    (first, second) => second.width * second.height - first.width * first.height,
  );

  for (let round = 0; round < 9; round += 1) {
    const placed: StoryTitlePlacement[] = [];
    const placements = Array<StoryTitlePlacement | undefined>(items.length);
    let complete = true;

    for (const item of packingOrder) {
      const random = seededRandom(
        item.seed ^
          Math.imul(item.index + 1, 0x9e3779b1) ^
          Math.imul(round + 1, 0x85ebca6b),
      );
      const maxLeft = Math.max(0, availableWidth - item.width);
      const maxTop = Math.max(0, height - item.height - edge * 2);
      let placement: StoryTitlePlacement | undefined;

      for (let attempt = 0; attempt < 600; attempt += 1) {
        const candidate = {
          left: edge + Math.round(random() * maxLeft),
          top: edge + Math.round(random() * maxTop),
          width: item.width,
          height: item.height,
        };

        if (placed.every((other) => !overlaps(candidate, other))) {
          placement = candidate;
          break;
        }
      }

      if (!placement) {
        complete = false;
        break;
      }

      placed.push(placement);
      placements[item.index] = placement;
    }

    if (complete) {
      return {
        placements: placements as StoryTitlePlacement[],
        height,
      };
    }

    height = Math.ceil(height * 1.16) + gap;
  }

  const placements: StoryTitlePlacement[] = [];
  let rowLeft = edge;
  let rowTop = edge;
  let rowHeight = 0;

  for (const item of items) {
    if (rowLeft > edge && rowLeft + item.width > width - edge) {
      rowLeft = edge;
      rowTop += rowHeight + gap;
      rowHeight = 0;
    }

    placements.push({
      left: rowLeft,
      top: rowTop,
      width: item.width,
      height: item.height,
    });
    rowLeft += item.width + gap;
    rowHeight = Math.max(rowHeight, item.height);
  }

  return {
    placements,
    height: Math.max(
      defaultMinHeight,
      Math.floor(minimumHeight),
      rowTop + rowHeight + edge,
    ),
  };
}
