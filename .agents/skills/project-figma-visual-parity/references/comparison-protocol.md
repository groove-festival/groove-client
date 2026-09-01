# Comparison protocol

## Required flow

Use this sequence for each target frame and required state:

```text
exact Figma node and state
  -> hierarchy, paint order, masks, tokens, typography, and assets
  -> FSD-aligned React implementation
  -> behavior, type/build, and FSD checks selected for the change
  -> real-browser screenshot under pinned conditions
  -> local full-image diff and manifest
  -> focused region composites during the correction loop
  -> final full expected / actual / diff inspection
  -> final artifacts, measured status, and remaining differences
```

The screenshot comparison is a required closure step, not an optional visual
review after implementation. Restart it after the last source change.

## Evidence layers

Use all layers that apply. One layer cannot silently stand in for another.

| Layer         | Target                                       | Actual                           | Evidence                                        |
| ------------- | -------------------------------------------- | -------------------------------- | ----------------------------------------------- |
| Static visual | Original frame or component export           | Real browser screenshot          | expected, actual, diff, pixel-difference metric |
| Geometry      | Figma node bounds                            | DOM `getBoundingClientRect()`    | key-region table in CSS pixels                  |
| Semantic      | variables, text styles, assets, Code Connect | tokens, copy, assets, components | mapping and mismatch list                       |
| Behavior      | Prototype actions and destination states     | React actions and visible states | Playwright steps and assertions                 |

## Capture contract

Record these values for every case:

```markdown
- Figma file / node:
- Prototype flow:
- Application route / locator:
- UI state / fixture:
- Viewport / DPR:
- Browser / version:
- Theme / locale / reduced motion:
- Font and asset readiness:
- Font family / file or service / style-weight mapping:
- Expected image:
- Actual image:
- Diff image:
- Pixel-difference metric and threshold:
```

Use the same viewport as the Figma frame unless the task explicitly tests a
responsive transformation. Use `deviceScaleFactor: 1` and Playwright screenshot
options `scale: "css"`, `animations: "disabled"`, and `caret: "hide"`. Wait for
`document.fonts.ready` and for each relevant image to be complete. Stabilize
time, random values, authentication, API responses, consent state, and telemetry
UI before capture.

For each required font, record the Figma family and style plus the browser file
or service and computed weight. Wait on `document.fonts.ready` and check the
specific family. If the binary or version is unknown, say so. Identical metrics
or a successful load do not by themselves prove identical rasterization.

Store transient evidence below Playwright's ignored `test-results/` directory.
Commit baselines only when the team intentionally adopts them and records the
capture environment. Never update a baseline merely because a test failed.

## Lightweight comparison loop

Run the canonical script from the repository root after each capture:

```sh
node .agents/skills/project-figma-visual-parity/scripts/compare-visuals.mjs \
  --expected <figma-frame.png> \
  --actual <browser.png> \
  --out-dir test-results/figma-parity/<case>
```

Read evidence in this order during an ordinary iteration:

1. `manifest.json` metrics, dimensions, region count, and reported coverage;
2. the `recommendedRegionIds` composites in order, stopping when the current
   mismatch is explained;
3. remaining listed composites only when the recommended set is insufficient;
4. Figma node or DOM evidence for the mismatch being corrected.

Each composite is ordered `expected | actual | diff`. The script compares the
entire image even when the model reads only crops. The default channel delta of
8 selects useful regions and does not define success. `differentPixels` and
`differentRatio` continue to include every non-identical pixel.

Inspect the complete expected, actual, and full diff at the initial baseline
and after the final source change. Also inspect them during an iteration when:

- expected and actual dimensions differ;
- `recommendedCoverage` is below `0.9`;
- `totalRegions` exceeds `reportedRegions` and the remainder can affect the
  decision;
- the global difference worsens or moves outside the inspected regions;
- fonts, assets, viewport, state, or source node changed;
- the crop evidence does not explain the metric.

Do not save tokens by reducing screenshot resolution, masking regions, raising
the acceptance threshold, or skipping the final full comparison.

## Geometry table

Measure meaningful regions rather than every decorative node.

```markdown
| Element              | Figma x/y/w/h | DOM x/y/w/h | Max delta | Result |
| -------------------- | ------------- | ----------- | --------- | ------ |
| page container       |               |             |           |        |
| primary heading      |               |             |           |        |
| primary action       |               |             |           |        |
| repeated card or row |               |             |           |        |
```

Coordinates must use the same frame origin and CSS-pixel scale. A transformed,
scrolled, or nested frame needs an explicit normalization note.

## Iteration log

```markdown
| Iteration | Measured difference | Main mismatch | Correction      | Result |
| --------- | ------------------- | ------------- | --------------- | ------ |
| 0         |                     |               | initial capture |        |
| 1         |                     |               |                 |        |
```

Correct one related mismatch group at a time. Preserve the prior artifact so a
regression is visible. Stop at the target, after five iterations, after two
non-improving iterations, or at a documented blocker.

For every correction, link the cause to node metadata, an exact export, a DOM
measurement, or a visible diff region. Reject changes that improve a global
number by distorting aspect ratio, changing semantics, masking the tested area,
or introducing an unexplained offset or effect.

## Final report

```markdown
- Final status: pixel 동일 / 허용 오차 이내 / 불일치 / 미실행 / 수동 확인 필요
- Static visual result:
- Geometry result:
- Semantic result:
- Prototype flow result:
- Performed commands:
- Final expected / actual / diff artifacts:
- Remaining differences or blockers:
```

Only use `pixel 동일` when the recorded diff is zero. Without an explicit
screen threshold, report the metric and differences but do not label them as a
pass.
