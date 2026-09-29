interface StoryTitleIdentity {
  storyId: number;
  title: string;
}

export interface StoryTitleAppearance {
  color: string;
  delay: number;
  driftX: number;
  driftY: number;
  duration: number;
  fontSize: string;
  fontWeight: number;
  fromRotate: number;
  seed: number;
  toRotate: number;
}

export interface StoryWithTitleAppearance<TStory extends StoryTitleIdentity> {
  appearance: StoryTitleAppearance;
  story: TStory;
}

const fontSizes = ["0.75rem", "1rem", "1.375rem", "1.875rem", "2.5rem"];
const fontWeights = [450, 560, 680, 800, 900];
const colors = ["#ff0080", "#00ffff", "#fcfcfc", "#cfff04", "#ff2e9a"];

function hashStory(story: StoryTitleIdentity): number {
  const source = `${story.storyId}:${story.title}`;
  let hash = 0;

  for (let index = 0; index < source.length; index += 1) {
    hash = (Math.imul(hash, 31) + source.charCodeAt(index)) >>> 0;
  }

  return hash;
}

function mixSeed(first: number, second: number): number {
  let value = (first ^ second) >>> 0;
  value = Math.imul(value ^ (value >>> 16), 0x7feb352d);
  value = Math.imul(value ^ (value >>> 15), 0x846ca68b);
  return (value ^ (value >>> 16)) >>> 0;
}

function randomBetween(seed: number, salt: number, min: number, max: number): number {
  const normalized = mixSeed(seed, salt) / 4_294_967_296;
  return min + normalized * (max - min);
}

function fontSizeForPosition(
  index: number,
  storyCount: number,
  titleLength: number,
): string {
  if (storyCount === 1) return fontSizes[titleLength <= 12 ? 3 : 2]!;

  const sizeIndex = Math.round((index * (fontSizes.length - 1)) / (storyCount - 1));
  const maxSizeIndex = titleLength <= 12 ? 4 : titleLength <= 24 ? 2 : 1;
  return fontSizes[Math.min(sizeIndex, maxSizeIndex)]!;
}

export function createStoryCloudSeed(): number {
  if (typeof crypto !== "undefined" && "getRandomValues" in crypto) {
    const values = new Uint32Array(1);
    crypto.getRandomValues(values);
    return values[0] ?? 0;
  }

  return Math.floor(Math.random() * 4_294_967_296);
}

export function createStoryTitleAppearances<TStory extends StoryTitleIdentity>(
  stories: readonly TStory[],
  cloudSeed: number,
): StoryWithTitleAppearance<TStory>[] {
  const randomizedStories = stories
    .map((story) => ({ seed: mixSeed(hashStory(story), cloudSeed), story }))
    .sort((first, second) => first.seed - second.seed);

  return randomizedStories.map(({ seed, story }, index) => ({
    story,
    appearance: {
      color: colors[mixSeed(seed, 2) % colors.length]!,
      delay: randomBetween(seed, 17, -4, 0),
      driftX: randomBetween(seed, 5, -14, 14),
      driftY: randomBetween(seed, 7, -18, 10),
      duration: randomBetween(seed, 13, 3.2, 6.2),
      fontSize: fontSizeForPosition(
        index,
        randomizedStories.length,
        story.title.length,
      ),
      fontWeight: fontWeights[mixSeed(seed, 3) % fontWeights.length]!,
      fromRotate: randomBetween(seed, 9, -14, 14),
      seed,
      toRotate: randomBetween(seed, 11, -18, 18),
    },
  }));
}
