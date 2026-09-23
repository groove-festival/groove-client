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
const gap = 24;
const minHeight = 336;

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
): { placements: StoryTitlePlacement[]; height: number } {
  const width = Math.max(1, Math.floor(containerWidth));
  const availableWidth = Math.max(1, width - edge * 2);
  const totalArea = sizes.reduce(
    (sum, size) =>
      sum +
      (Math.min(Math.max(size.width, 1), availableWidth) + gap) *
        (Math.max(size.height, 1) + gap),
    0,
  );
  let height = Math.max(minHeight, Math.ceil(totalArea / (width * 0.55)));
  const placements: StoryTitlePlacement[] = [];

  for (const [index, size] of sizes.entries()) {
    const itemWidth = Math.min(Math.max(size.width, 1), availableWidth);
    const itemHeight = Math.max(size.height, 1);
    const random = seededRandom(size.seed ^ Math.imul(index + 1, 0x9e3779b1));
    let placement: StoryTitlePlacement | undefined;

    for (let round = 0; round < 5 && !placement; round += 1) {
      const maxLeft = Math.max(0, availableWidth - itemWidth);
      const maxTop = Math.max(0, height - itemHeight - edge * 2);

      for (let attempt = 0; attempt < 100; attempt += 1) {
        const candidate = {
          left: edge + Math.round(random() * maxLeft),
          top: edge + Math.round(random() * maxTop),
          width: itemWidth,
          height: itemHeight,
        };

        if (placements.every((placed) => !overlaps(candidate, placed))) {
          placement = candidate;
          break;
        }
      }

      if (!placement) height += Math.max(itemHeight + gap, 72);
    }

    if (!placement) {
      placement = {
        left: edge + Math.round(random() * Math.max(0, availableWidth - itemWidth)),
        top: height + gap,
        width: itemWidth,
        height: itemHeight,
      };
      height = placement.top + itemHeight + edge;
    }

    placements.push(placement);
  }

  return {
    placements,
    height: Math.max(
      height,
      ...placements.map((item) => item.top + item.height + edge),
    ),
  };
}
