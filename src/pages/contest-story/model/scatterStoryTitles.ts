export interface StoryTitleSize {
  width: number;
  height: number;
  seed: number;
  variants?: readonly StoryTitleVariant[];
}

export interface StoryTitleVariant {
  width: number;
  height: number;
  rotation: number;
}

export interface StoryTitlePlacement {
  left: number;
  top: number;
  width: number;
  height: number;
  rotation: number;
}

const edge = 8;
const gap = 4;
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
  const items = sizes.map((size, index) => {
    const variants = (
      size.variants?.length
        ? size.variants
        : [{ height: size.height, rotation: 0, width: size.width }]
    ).map((variant) => ({
      height: Math.max(variant.height, 1),
      rotation: variant.rotation,
      width: Math.min(Math.max(variant.width, 1), availableWidth),
    }));

    return { index, seed: size.seed, variants };
  });
  const totalArea = items.reduce(
    (sum, item) =>
      sum +
      Math.min(
        ...item.variants.map(
          (variant) => (variant.width + gap) * (variant.height + gap),
        ),
      ),
    0,
  );
  let height = Math.max(
    defaultMinHeight,
    Math.floor(minimumHeight),
    Math.ceil(totalArea / (width * 0.88)),
  );
  const packingOrder = [...items].sort(
    (first, second) =>
      Math.min(...second.variants.map((variant) => variant.width * variant.height)) -
      Math.min(...first.variants.map((variant) => variant.width * variant.height)),
  );

  for (let round = 0; round < 18; round += 1) {
    const placed: StoryTitlePlacement[] = [];
    const placements = Array<StoryTitlePlacement | undefined>(items.length);
    let complete = true;

    for (const item of packingOrder) {
      const random = seededRandom(
        item.seed ^
          Math.imul(item.index + 1, 0x9e3779b1) ^
          Math.imul(round + 1, 0x85ebca6b),
      );
      let placement: StoryTitlePlacement | undefined;
      let placementScore = Number.POSITIVE_INFINITY;
      const preferredVariantIndex = item.seed % item.variants.length;

      for (let attempt = 0; attempt < 900; attempt += 1) {
        const variantIndex = Math.floor(random() * item.variants.length);
        const variant = item.variants[variantIndex]!;
        const maxLeft = Math.max(0, availableWidth - variant.width);
        const maxTop = Math.max(0, height - variant.height - edge * 2);
        const candidate = {
          left: edge + Math.round(random() * maxLeft),
          top: edge + Math.round(random() * maxTop),
          width: variant.width,
          height: variant.height,
          rotation: variant.rotation,
        };

        if (placed.every((other) => !overlaps(candidate, other))) {
          const score =
            candidate.top +
            random() * height * 0.18 -
            (variantIndex === preferredVariantIndex ? height * 0.06 : 0) +
            (variant.width * variant.height * 0.12) / availableWidth;

          if (score < placementScore) {
            placement = candidate;
            placementScore = score;
          }
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
      const usedHeight = Math.max(
        defaultMinHeight,
        Math.floor(minimumHeight),
        ...placed.map((placement) => placement.top + placement.height + edge),
      );

      return {
        placements: placements as StoryTitlePlacement[],
        height: Math.min(height, usedHeight),
      };
    }

    if ((round + 1) % 4 === 0) {
      height = Math.ceil(height * 1.06) + gap;
    }
  }

  const placements: StoryTitlePlacement[] = [];
  let rowLeft = edge;
  let rowTop = edge;
  let rowHeight = 0;

  for (const item of items) {
    const variant = item.variants[0]!;

    if (rowLeft > edge && rowLeft + variant.width > width - edge) {
      rowLeft = edge;
      rowTop += rowHeight + gap;
      rowHeight = 0;
    }

    placements.push({
      left: rowLeft,
      top: rowTop,
      width: variant.width,
      height: variant.height,
      rotation: variant.rotation,
    });
    rowLeft += variant.width + gap;
    rowHeight = Math.max(rowHeight, variant.height);
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
