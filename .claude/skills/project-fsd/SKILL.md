---
name: project-fsd
description: Place and review frontend code using this repository's Feature-Sliced Design layers, slices, segments, public APIs, and Steiger checks. Use for every frontend implementation or structural review, including file, import, and public API changes.
---

# Project FSD

Use `docs/FSD_ARCHITECTURE.md` as the repository source of truth and confirm the
current tree before choosing a location.

## Place the change

1. Identify the code's responsibility and reuse boundary.
2. Choose the lowest suitable standard layer. Do not create an empty layer or
   use deprecated `processes`.
3. On `pages`, `widgets`, `features`, and `entities`, create a business slice
   before purpose-based segments such as `ui`, `api`, `model`, or `config`.
4. On sliceless `app` and `shared`, use a segment name that describes purpose.
5. Expose cross-slice imports through the slice or segment `index.ts`. Do not
   add a layer-level barrel.

Keep dependencies downward:

```text
app → pages → widgets → features → entities → shared
```

Different slices on the same layer must not import one another. Use relative
imports inside a slice and the `@/` alias through public APIs across boundaries.

## Verify

Run `pnpm check:fsd` after the final change and before handing off every frontend
implementation or structural review. Also run the risk-relevant type and
behavior checks routed by `project-testing` and `project-quality-gates`. Do not
disable a Steiger rule merely to clear a failure; first confirm the placement
against the official FSD rule and `docs/FSD_ARCHITECTURE.md`. Document any
necessary narrow exception in both the Steiger configuration and the
architecture guide.
