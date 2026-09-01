# Optional Figma QA writeback

Use this path only after explicit authorization to write to Figma. Reading a
Figma URL or authenticating MCP does not grant that authorization.

## Destination and layout

- Keep the product's source design read-only.
- Create or use a clearly named `Implementation QA` page or file.
- Put the source-frame reference, browser capture, editable reconstruction, and
  measured annotations side by side.
- Label route, viewport, state or fixture, commit hash when one exists, capture
  time, and remaining mismatches.

Use the Figma MCP code-to-canvas or write tools only when available to the
authenticated account. Verify the created nodes by reading them back and, when
possible, visually inspect the resulting page.

## Interpretation

The editable reconstruction is a discussion and annotation surface. It is a
second transformation of the browser result, so it cannot prove parity with the
source frame. Never overwrite the source design, silently promote generated
layers to the product source, or use Figma writeback as a replacement for the
original-export versus real-browser diff.

If writing or readback fails, do not claim that a QA artifact exists. Report the
external write as failed or unrun and retain local comparison evidence.
