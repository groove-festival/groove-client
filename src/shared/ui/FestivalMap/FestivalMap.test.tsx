import { act, render, waitFor } from "@testing-library/react";
import type { CSSProperties, ReactNode } from "react";

import { FestivalMap } from "./FestivalMap";

const mapControls = vi.hoisted(() => ({
  setTransform: vi.fn(),
  zoomIn: vi.fn(),
  zoomOut: vi.fn(),
}));

vi.mock("react-zoom-pan-pinch", async () => {
  const { forwardRef, useImperativeHandle } = await import("react");

  const TransformWrapper = forwardRef<unknown, { children: ReactNode }>(
    ({ children }, ref) => {
      useImperativeHandle(ref, () => mapControls);
      return children;
    },
  );

  const TransformComponent = ({
    children,
    contentStyle,
    wrapperStyle,
  }: {
    children: ReactNode;
    contentStyle?: CSSProperties;
    wrapperStyle?: CSSProperties;
  }) => (
    <div style={wrapperStyle}>
      <div style={contentStyle}>{children}</div>
    </div>
  );

  return { TransformComponent, TransformWrapper };
});

describe("FestivalMap", () => {
  it("applies a focus requested before the map container is measured", async () => {
    let width = 0;
    let height = 0;
    let resize: ResizeObserverCallback | null = null;

    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(
      () =>
        ({
          bottom: height,
          height,
          left: 0,
          right: width,
          top: 0,
          width,
          x: 0,
          y: 0,
          toJSON: () => ({}),
        }) as DOMRect,
    );
    vi.stubGlobal(
      "ResizeObserver",
      class {
        constructor(callback: ResizeObserverCallback) {
          resize = callback;
        }

        disconnect() {}
        observe() {}
        unobserve() {}
      },
    );

    render(
      <FestivalMap
        focus={{ xRatio: 0.25, yRatio: 0.75, scale: 2 }}
        source={{ alt: "축제 지도", height: 100, width: 100 }}
      />,
    );

    expect(mapControls.setTransform).not.toHaveBeenCalled();

    width = 360;
    height = 448;
    act(() => resize?.([], {} as ResizeObserver));

    await waitFor(() =>
      expect(mapControls.setTransform).toHaveBeenLastCalledWith(
        0,
        -316,
        2,
        400,
        "easeOut",
      ),
    );
  });
});
