---
name: project-figma-visual-parity
description: Implement and verify Figma-backed React screens by comparing source frames and prototype states with actual browser rendering using Figma MCP, Playwright, geometry and token evidence, and bounded correction loops. Use when a task includes a Figma node or prototype URL or requests visual fidelity; do not claim parity without an inspectable target and rendered route.
---

# Project Figma Visual Parity

Use this Skill when Figma is an implementation source or the user asks to
reduce visual differences. The acceptance target is the rendered React UI, not
HTML reconstructed inside Figma.

## Establish an inspectable target

Before implementation or comparison, identify:

- the exact Figma file and frame or component node URL;
- the Prototype flow URL when interaction is in scope;
- the application route or component and a stable locator;
- viewport, device pixel ratio, theme, locale, and UI state;
- deterministic fixtures for data, time, permissions, and network responses;
- an authenticated Figma MCP connection with access to that file.

If any item that changes the result is missing, obtain it or report the affected
check as `미실행` or `수동 확인 필요`. Never infer a target from a nearby frame.
A provided link authorizes inspection only. Do not edit a Figma file or create a
QA page unless the user separately authorizes that external write.

## Collect Figma evidence

For a large page, inspect metadata first and request detailed context only for
the target nodes. Collect the available evidence with Figma MCP:

1. node hierarchy, bounds, variants, and layout metadata;
2. design context for the selected frame or component;
3. variable definitions and Code Connect mappings when present;
4. an original-resolution frame export or screenshot;
5. Prototype starting point, actions, overlays, and destination states.

For each visible text role, record the exact family, style, weight, size,
line-height, letter-spacing, alignment, and wrapping bounds. Identify the font
file or service used by the browser and confirm its availability and license.
Never silently substitute a fallback or guess a weight. If the Figma font binary
or version cannot be established, record that limitation; a matching family
name alone does not prove identical glyph rendering.

Inspect paint order, clipping and masks, blend modes, image-fill transforms, and
effects before extracting assets. A raw child asset is not equivalent to the
rendered node when Figma applies those properties. Prefer an exact node or
component export when it preserves a design-authored crop, rotation, mask, or
decorative text outline.

Treat generated code as a hint, not as the repository architecture. Reuse the
repository's existing components, tokens, assets, and FSD public APIs. Load
`project-fsd` for placement or import decisions and `project-testing` when the
flow needs non-trivial coverage.

## Apply the repository mobile frame rule

The global app frame already belongs to `AppComposition` and caps public user
pages at 600px. Do not add a nested page-level frame wrapper for Figma screens.
Fixed top navigation should align to the app frame with `w-full max-w-[600px]`
and a matching 64px body spacer, unless the source design requires a different
product behavior.

For ordinary user-facing screens, do not keep a 393px Figma canvas and scale it
up wholesale. Translate the design into responsive React layout with `w-full`,
container padding, flex/grid, aspect-ratio, and sensible max widths. Treat
Figma `left`, `top`, and fixed-width values as source measurements, not as the
runtime layout contract.

For image and video media, choose an explicit aspect ratio for the component's
role before sizing it. Use `object-cover` or `object-contain` within that
ratio, and set `object-position` whenever crop matters. If readable text sits
on top of media, add a contrast overlay, gradient scrim, text shadow, or a
separate safe area so text contrast does not depend on whichever image region
happens to be visible at a wider viewport.

For media hero sections where text, logos, and decorative elements overlap the
same image, keep foreground elements tied to one visual stage or to the app
frame center. Do not mix unrelated anchors such as pinning one element to the
viewport left while centering another over the media. Layer media first, then
contrast overlay, supporting foreground text, primary logo or decoration, and
finally navigation or interactive controls.

If text must pass behind a foreground object that is baked into a flat image,
z-index changes alone cannot solve it. Split the visual into background and
foreground layers, or derive a transparent foreground layer from the source
asset, then place both layers in the same visual stage.

Coordinate preservation and scale calculations are reserved for map screens in
this project, where booth or zone marker coordinates must remain tied to a
map image or measured board. For those screens, calculate marker positions from
the rendered container size, preferably with ResizeObserver or equivalent
measured layout state. Do not use a global zoom wrapper for non-map UI.

For final browser evidence, include the mobile viewport and at least one wider
viewport to confirm the header, key media, forms, and cards use the available
app-frame width and cap at 600px. For map screens, also verify marker alignment
after the container resizes.

## Normalize and capture the browser

Use the repository Playwright installation and the real route. Pin Chromium,
viewport, `deviceScaleFactor: 1`, color scheme, locale, and data state. Use CSS
pixel screenshot scale, disable animations and the caret, and wait for fonts,
images, and required network state before every capture. Do not compare states
captured under different conditions.

Use the source frame export as the static visual oracle. Use the Prototype to
exercise the same actions and assert the same visible states in the React app;
the Prototype viewer itself may scale or decorate the canvas and is not the
pixel oracle.

Follow [references/comparison-protocol.md](references/comparison-protocol.md)
for capture evidence and acceptance language.

Before capture, verify `document.fonts.ready`, `document.fonts.check(...)` for
each required family, and completion of every relevant image. A font-loading
check proves availability, not pixel equality: Figma and Chromium can rasterize
the same font differently. Keep semantic form and body copy as live text.
Decorative display text may use a design-authored vector or outline export only
when accessibility and content semantics remain available in the DOM.

## Keep the correction loop lightweight

Preserve full-resolution verification while minimizing what the model must
re-read:

1. inspect the complete Figma target and baseline browser image once;
2. keep the extracted hierarchy, typography, asset, and environment mapping for
   that unchanged target instead of requesting the same context again;
3. after each correction, run the local full-image comparison script and read
   `manifest.json` first;
4. inspect the manifest's recommended region composites in order during an
   ordinary iteration, expanding to the remaining listed regions only when the
   current evidence does not explain the metric;
5. inspect the complete expected, actual, and diff images again for final
   closure or when an escalation condition applies.

Run from the repository root:

```sh
node .agents/skills/project-figma-visual-parity/scripts/compare-visuals.mjs \
  --expected <figma-frame.png> \
  --actual <browser.png> \
  --out-dir test-results/figma-parity/<case>
```

The script still compares every pixel. It writes exact and over-threshold
metrics, a full diff, and bounded `expected | actual | diff` region composites.
Its channel threshold is only for choosing regions to inspect; never use it as
an acceptance threshold. Trust the generated manifest for the current run and
ignore stale region files not listed there.

Escalate from crops to the full images when dimensions differ, recommended
regions cover less than 90% of the selected difference pixels, omitted regions
remain after the region limit, a global metric worsens, a crop does not explain
the change, the target state or capture environment changed, or the comparison
is the final one. This reduces model input, not validation coverage.

## Compare and correct

For every required viewport and state, compare:

1. expected frame image against actual browser image and a generated diff;
2. Figma bounds against key DOM bounding boxes in CSS pixels;
3. text, font, token, asset, and component mappings;
4. Prototype actions and destinations against application state transitions.

Correct in this order so later measurements stay meaningful:

1. wrong content, data, variant, or state;
2. wrong frame, breakpoint, container, or layout model;
3. geometry and alignment;
4. typography and text wrapping;
5. assets and icon rendering;
6. spacing, color, border, radius, and shadow.

Re-capture under the same conditions after each correction and record the
metric before and after. Default to at most five iterations per state. Stop
earlier when the target is met, or when two consecutive iterations do not
improve the measured difference. Also stop for ambiguous source design,
unavailable fonts or assets, authentication failure, or nondeterministic data;
report the blocker instead of hiding it with a broader threshold, mask, skip,
or weakened assertion.

Every correction must be supported by a Figma node property, exported asset, DOM
measurement, or observed screenshot difference. Do not stretch an asset
non-uniformly, add arbitrary offsets, blur a mismatch, mask a region, or weaken
the metric merely to make the score look better. Preserve the source aspect
ratio, layer semantics, and interactive behavior.

## Mandatory final visual closure

A Figma-backed implementation is not finished after DOM, unit, build, or FSD
checks alone. After the final source change:

1. run the smallest relevant behavior and repository structure checks;
2. open the real application route with the pinned capture environment;
3. capture a new full target screenshot after fonts, assets, and state settle;
4. run the full-image comparison script, then inspect the complete source frame,
   browser capture, and generated diff;
5. diagnose paint order, clipping, typography, assets, effects, and geometry;
6. apply only evidence-backed corrections and repeat the same capture;
7. preserve the final expected, actual, diff, environment, and metric evidence.

This final browser capture and comparison is mandatory for every implemented
Figma target. If it cannot run, report `미실행`; if a nonzero difference remains
without an agreed threshold, report `불일치`. A previous capture made before the
last source change is not final evidence.

## Decide the result truthfully

- `pixel 동일`: image diff is zero under the recorded pinned environment.
- `허용 오차 이내`: the explicit screen-specific pixel threshold is met and
  all required geometry, semantics, and flow checks pass.
- `불일치`: measured differences remain outside the target.
- `미실행`: comparison did not run, with the reason and affected states.
- `수동 확인 필요`: a human judgment or unavailable environment is required.

Do not invent a default threshold. If the task has no agreed threshold, report
the measured result without declaring visual success. As an initial operating
rule, key non-text geometry should differ by no more than one CSS pixel; record
font-rendering exceptions rather than silently accepting them.

Treat a request for "100%" accuracy as a zero-diff target under the pinned
environment, not as permission to round a metric or ignore antialiasing. If
Figma and Chromium renderer differences make live text nonzero, state that
constraint and show the measured remainder. Do not call it identical.

After frontend source, placement, public API, or import changes, run
`pnpm check:fsd`. Run the smallest relevant behavior test and expand to wider
quality gates only when the risk requires it. Report actual commands, artifacts,
failed or unrun states, and remaining differences in the final handoff.

## Optional Figma QA writeback

When the user explicitly requests an editable Figma comparison artifact, follow
[references/figma-writeback.md](references/figma-writeback.md). A generated
Figma reconstruction is supporting evidence only and never replaces the source
frame or the browser-to-frame comparison.
