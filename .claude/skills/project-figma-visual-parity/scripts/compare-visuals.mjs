#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { chromium } from "@playwright/test";

const defaults = {
  threshold: 8,
  tileSize: 64,
  margin: 24,
  maxRegions: 6,
};

function printHelp() {
  console.log(`Usage:
  node .agents/skills/project-figma-visual-parity/scripts/compare-visuals.mjs \\
    --expected <figma.png> --actual <browser.png> --out-dir <directory>

Options:
  --threshold <0-255>    Region-triage channel delta (default: 8)
  --tile-size <pixels>   Tile size used to group differences (default: 64)
  --margin <pixels>      Context around each reported region (default: 24)
  --max-regions <count>  Maximum composite crops to emit (default: 6)
  --fail-on-diff         Exit with code 1 when any pixel differs
  --help                 Show this help

The threshold selects regions for AI inspection only. Exact-diff metrics always
include every changed pixel and remain the acceptance evidence.`);
}

function parseArgs(argv) {
  const options = { ...defaults, failOnDiff: false };

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];

    if (argument === "--help") {
      options.help = true;
      continue;
    }
    if (argument === "--fail-on-diff") {
      options.failOnDiff = true;
      continue;
    }

    const value = argv[index + 1];
    if (!value) {
      throw new Error(`Missing value for ${argument}`);
    }

    switch (argument) {
      case "--expected":
        options.expected = value;
        break;
      case "--actual":
        options.actual = value;
        break;
      case "--out-dir":
        options.outDir = value;
        break;
      case "--threshold":
        options.threshold = Number(value);
        break;
      case "--tile-size":
        options.tileSize = Number(value);
        break;
      case "--margin":
        options.margin = Number(value);
        break;
      case "--max-regions":
        options.maxRegions = Number(value);
        break;
      default:
        throw new Error(`Unknown argument: ${argument}`);
    }
    index += 1;
  }

  return options;
}

function validateOptions(options) {
  for (const key of ["expected", "actual", "outDir"]) {
    if (!options[key]) {
      throw new Error(
        `Missing required option: --${key.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)}`,
      );
    }
  }

  const integerRanges = {
    threshold: [0, 255],
    tileSize: [8, 512],
    margin: [0, 512],
    maxRegions: [1, 20],
  };

  for (const [key, [minimum, maximum]] of Object.entries(integerRanges)) {
    const value = options[key];
    if (!Number.isInteger(value) || value < minimum || value > maximum) {
      throw new Error(`${key} must be an integer from ${minimum} to ${maximum}`);
    }
  }
}

function imageMime(filePath) {
  const extension = path.extname(filePath).toLowerCase();
  if (extension === ".jpg" || extension === ".jpeg") return "image/jpeg";
  if (extension === ".webp") return "image/webp";
  return "image/png";
}

function toDataUrl(buffer, mime) {
  return `data:${mime};base64,${buffer.toString("base64")}`;
}

function dataUrlBuffer(dataUrl) {
  const separator = dataUrl.indexOf(",");
  if (separator < 0) throw new Error("Invalid image data URL");
  return Buffer.from(dataUrl.slice(separator + 1), "base64");
}

async function analyze(options) {
  const [expectedBuffer, actualBuffer] = await Promise.all([
    readFile(options.expected),
    readFile(options.actual),
  ]);
  const browser = await chromium.launch({ args: ["--force-color-profile=srgb"] });

  try {
    const page = await browser.newPage({ deviceScaleFactor: 1 });
    return await page.evaluate(
      async ({ expectedUrl, actualUrl, threshold, tileSize, margin, maxRegions }) => {
        const loadImage = (source) =>
          new Promise((resolve, reject) => {
            const image = new Image();
            image.onload = () => resolve(image);
            image.onerror = () =>
              reject(new Error("Unable to decode comparison image"));
            image.src = source;
          });
        const createCanvas = (width, height) => {
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          return canvas;
        };
        const round = (value, places) => Number(value.toFixed(places));

        const [expectedImage, actualImage] = await Promise.all([
          loadImage(expectedUrl),
          loadImage(actualUrl),
        ]);
        if (
          expectedImage.naturalWidth !== actualImage.naturalWidth ||
          expectedImage.naturalHeight !== actualImage.naturalHeight
        ) {
          throw new Error(
            `Image dimensions differ: expected ${expectedImage.naturalWidth}x${expectedImage.naturalHeight}, actual ${actualImage.naturalWidth}x${actualImage.naturalHeight}`,
          );
        }

        const width = expectedImage.naturalWidth;
        const height = expectedImage.naturalHeight;
        const expectedCanvas = createCanvas(width, height);
        const actualCanvas = createCanvas(width, height);
        const diffCanvas = createCanvas(width, height);
        const expectedContext = expectedCanvas.getContext("2d", {
          willReadFrequently: true,
        });
        const actualContext = actualCanvas.getContext("2d", {
          willReadFrequently: true,
        });
        const diffContext = diffCanvas.getContext("2d");
        expectedContext.drawImage(expectedImage, 0, 0);
        actualContext.drawImage(actualImage, 0, 0);

        const expectedPixels = expectedContext.getImageData(0, 0, width, height);
        const actualPixels = actualContext.getImageData(0, 0, width, height);
        const diffPixels = diffContext.createImageData(width, height);
        const tileColumns = Math.ceil(width / tileSize);
        const tileRows = Math.ceil(height / tileSize);
        const tileCount = tileColumns * tileRows;
        const anyDifferenceByTile = new Array(tileCount).fill(0);
        const overThresholdByTile = new Array(tileCount).fill(0);
        let differentPixels = 0;
        let overThresholdPixels = 0;
        let absoluteChannelDelta = 0;
        let maxChannelDelta = 0;

        for (let y = 0; y < height; y += 1) {
          for (let x = 0; x < width; x += 1) {
            const pixelIndex = y * width + x;
            const offset = pixelIndex * 4;
            let maximum = 0;

            for (let channel = 0; channel < 4; channel += 1) {
              const delta = Math.abs(
                expectedPixels.data[offset + channel] -
                  actualPixels.data[offset + channel],
              );
              absoluteChannelDelta += delta;
              maximum = Math.max(maximum, delta);
            }

            const tileIndex =
              Math.floor(y / tileSize) * tileColumns + Math.floor(x / tileSize);
            if (maximum > 0) {
              differentPixels += 1;
              anyDifferenceByTile[tileIndex] += 1;
            }
            if (maximum > threshold) {
              overThresholdPixels += 1;
              overThresholdByTile[tileIndex] += 1;
            }
            maxChannelDelta = Math.max(maxChannelDelta, maximum);

            diffPixels.data[offset] = Math.min(
              255,
              actualPixels.data[offset] / 8 + maximum * 3,
            );
            diffPixels.data[offset + 1] = actualPixels.data[offset + 1] / 8;
            diffPixels.data[offset + 2] = Math.min(
              255,
              actualPixels.data[offset + 2] / 8 + maximum * 2,
            );
            diffPixels.data[offset + 3] = 255;
          }
        }
        diffContext.putImageData(diffPixels, 0, 0);

        const regionBasis = overThresholdPixels > 0 ? "over-threshold" : "any-diff";
        const selectedTiles =
          regionBasis === "over-threshold" ? overThresholdByTile : anyDifferenceByTile;
        const basisPixels =
          regionBasis === "over-threshold" ? overThresholdPixels : differentPixels;
        const visited = new Array(tileCount).fill(false);
        const components = [];

        for (let start = 0; start < tileCount; start += 1) {
          if (visited[start] || selectedTiles[start] === 0) continue;

          const queue = [start];
          visited[start] = true;
          let minimumColumn = tileColumns;
          let maximumColumn = 0;
          let minimumRow = tileRows;
          let maximumRow = 0;
          let affectedPixels = 0;

          for (let cursor = 0; cursor < queue.length; cursor += 1) {
            const tileIndex = queue[cursor];
            const row = Math.floor(tileIndex / tileColumns);
            const column = tileIndex % tileColumns;
            minimumColumn = Math.min(minimumColumn, column);
            maximumColumn = Math.max(maximumColumn, column);
            minimumRow = Math.min(minimumRow, row);
            maximumRow = Math.max(maximumRow, row);
            affectedPixels += selectedTiles[tileIndex];

            for (const [columnDelta, rowDelta] of [
              [-1, 0],
              [1, 0],
              [0, -1],
              [0, 1],
            ]) {
              const nextColumn = column + columnDelta;
              const nextRow = row + rowDelta;
              if (
                nextColumn < 0 ||
                nextColumn >= tileColumns ||
                nextRow < 0 ||
                nextRow >= tileRows
              ) {
                continue;
              }
              const nextIndex = nextRow * tileColumns + nextColumn;
              if (!visited[nextIndex] && selectedTiles[nextIndex] > 0) {
                visited[nextIndex] = true;
                queue.push(nextIndex);
              }
            }
          }

          const left = Math.max(0, minimumColumn * tileSize - margin);
          const top = Math.max(0, minimumRow * tileSize - margin);
          const right = Math.min(width, (maximumColumn + 1) * tileSize + margin);
          const bottom = Math.min(height, (maximumRow + 1) * tileSize + margin);
          components.push({
            x: left,
            y: top,
            width: right - left,
            height: bottom - top,
            affectedPixels,
          });
        }

        components.sort((left, right) => right.affectedPixels - left.affectedPixels);
        const selectedRegions = components.slice(0, maxRegions);
        const reportedAffectedPixels = selectedRegions.reduce(
          (total, region) => total + region.affectedPixels,
          0,
        );
        const recommendedRegionIds = [];
        let recommendedAffectedPixels = 0;
        for (let index = 0; index < selectedRegions.length; index += 1) {
          if (basisPixels > 0 && recommendedAffectedPixels / basisPixels >= 0.9) {
            break;
          }
          recommendedRegionIds.push(index + 1);
          recommendedAffectedPixels += selectedRegions[index].affectedPixels;
        }
        const gap = 4;
        const crops = selectedRegions.map((region, index) => {
          const composite = createCanvas(region.width * 3 + gap * 2, region.height);
          const context = composite.getContext("2d");
          context.fillStyle = "#111111";
          context.fillRect(0, 0, composite.width, composite.height);
          context.drawImage(
            expectedCanvas,
            region.x,
            region.y,
            region.width,
            region.height,
            0,
            0,
            region.width,
            region.height,
          );
          context.drawImage(
            actualCanvas,
            region.x,
            region.y,
            region.width,
            region.height,
            region.width + gap,
            0,
            region.width,
            region.height,
          );
          context.drawImage(
            diffCanvas,
            region.x,
            region.y,
            region.width,
            region.height,
            (region.width + gap) * 2,
            0,
            region.width,
            region.height,
          );

          return {
            id: index + 1,
            ...region,
            dataUrl: composite.toDataURL("image/png"),
          };
        });
        const totalPixels = width * height;

        return {
          width,
          height,
          metrics: {
            differentPixels,
            differentRatio: round(differentPixels / totalPixels, 6),
            overThresholdPixels,
            overThresholdRatio: round(overThresholdPixels / totalPixels, 6),
            meanAbsoluteChannelDelta: round(
              absoluteChannelDelta / (totalPixels * 4),
              4,
            ),
            maxChannelDelta,
          },
          regionSelection: {
            basis: regionBasis,
            tileSize,
            margin,
            maxRegions,
            totalRegions: components.length,
            reportedRegions: selectedRegions.length,
            reportedCoverage: basisPixels
              ? round(reportedAffectedPixels / basisPixels, 6)
              : 1,
            recommendedRegionIds,
            recommendedCoverage: basisPixels
              ? round(recommendedAffectedPixels / basisPixels, 6)
              : 1,
          },
          diffDataUrl: diffCanvas.toDataURL("image/png"),
          crops,
        };
      },
      {
        expectedUrl: toDataUrl(expectedBuffer, imageMime(options.expected)),
        actualUrl: toDataUrl(actualBuffer, imageMime(options.actual)),
        threshold: options.threshold,
        tileSize: options.tileSize,
        margin: options.margin,
        maxRegions: options.maxRegions,
      },
    );
  } finally {
    await browser.close();
  }
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    printHelp();
    return;
  }
  validateOptions(options);

  const expectedPath = path.resolve(options.expected);
  const actualPath = path.resolve(options.actual);
  const outputDirectory = path.resolve(options.outDir);
  await mkdir(outputDirectory, { recursive: true });
  const result = await analyze({
    ...options,
    expected: expectedPath,
    actual: actualPath,
  });
  const diffName = "diff-full.png";
  await writeFile(
    path.join(outputDirectory, diffName),
    dataUrlBuffer(result.diffDataUrl),
  );

  const regions = [];
  for (const crop of result.crops) {
    const name = `region-${String(crop.id).padStart(2, "0")}.png`;
    await writeFile(path.join(outputDirectory, name), dataUrlBuffer(crop.dataUrl));
    regions.push({
      id: crop.id,
      x: crop.x,
      y: crop.y,
      width: crop.width,
      height: crop.height,
      affectedPixels: crop.affectedPixels,
      composite: name,
      columnOrder: ["expected", "actual", "diff"],
    });
  }

  const manifest = {
    schemaVersion: 1,
    expected: expectedPath,
    actual: actualPath,
    dimensions: { width: result.width, height: result.height },
    threshold: options.threshold,
    thresholdPurpose: "region triage only; never an acceptance threshold",
    metrics: result.metrics,
    regionSelection: result.regionSelection,
    fullDiff: diffName,
    regions,
  };
  const manifestPath = path.join(outputDirectory, "manifest.json");
  await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");

  console.log(
    JSON.stringify({
      manifest: manifestPath,
      metrics: result.metrics,
      regionSelection: result.regionSelection,
    }),
  );

  if (options.failOnDiff && result.metrics.differentPixels > 0) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
