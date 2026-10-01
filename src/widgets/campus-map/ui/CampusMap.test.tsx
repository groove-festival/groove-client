import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";

import { CampusMap } from "./CampusMap";

interface FestivalMapSpyProps {
  children?: ReactNode;
  focusRequest?: { requestId: number } | null;
}

const festivalMapSpy = vi.hoisted(() => ({
  props: null as FestivalMapSpyProps | null,
}));

vi.mock("@/shared/ui", async (importOriginal) => {
  const original = await importOriginal<Record<string, unknown>>();

  return {
    ...original,
    FestivalMap: (props: FestivalMapSpyProps) => {
      festivalMapSpy.props = props;
      return props.children;
    },
  };
});

const watchPosition = vi.fn();
const clearWatch = vi.fn();

beforeEach(() => {
  festivalMapSpy.props = null;
  Object.defineProperty(navigator, "geolocation", {
    configurable: true,
    value: { clearWatch, watchPosition },
  });
});

afterEach(() => {
  vi.useRealTimers();
  vi.clearAllMocks();
});

describe("CampusMap location", () => {
  it("auto-focuses once, keeps moving the marker, and recenters on another click", async () => {
    let onSuccess: PositionCallback = () => {};
    watchPosition.mockImplementation((success) => {
      onSuccess = success;
      return 5;
    });

    render(
      <CampusMap
        box={{ height: 448, width: 361 }}
        closestWidth={40}
        initialView={{ width: 300, xRatio: 0.5, yRatio: 0.5 }}
        isLit={() => true}
        onSelect={() => {}}
        places={[]}
        selectedId={null}
      />,
    );

    expect(watchPosition).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "내 위치 보기" }));

    act(() =>
      onSuccess({
        coords: { accuracy: 10, latitude: 35.8886615, longitude: 128.6121297 },
        timestamp: 1,
      } as GeolocationPosition),
    );

    await waitFor(() => expect(festivalMapSpy.props?.focusRequest?.requestId).toBe(1));
    expect(
      screen.getByText("GPS 환경에 따라 실제 위치와 차이가 있을 수 있어요"),
    ).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "GPS 측정 기록" })).toHaveTextContent(
      "GPS 측정 #1",
    );
    expect(screen.getByRole("region", { name: "GPS 측정 기록" })).toHaveTextContent(
      "35.8886615",
    );
    expect(screen.queryByText("이 범위 안 어딘가")).not.toBeInTheDocument();
    const firstMarkerLeft = screen.getByRole("img", { name: "현재 위치" }).parentElement
      ?.style.left;

    act(() =>
      onSuccess({
        coords: { accuracy: 10, latitude: 35.8888, longitude: 128.6123 },
        timestamp: 2,
      } as GeolocationPosition),
    );

    await waitFor(() =>
      expect(
        screen.getByRole("img", { name: "현재 위치" }).parentElement?.style.left,
      ).not.toBe(firstMarkerLeft),
    );
    expect(screen.getByRole("region", { name: "GPS 측정 기록" })).toHaveTextContent(
      "GPS 측정 #2",
    );
    expect(festivalMapSpy.props?.focusRequest?.requestId).toBe(1);

    fireEvent.click(screen.getByRole("button", { name: "내 위치 보기" }));

    await waitFor(() => expect(festivalMapSpy.props?.focusRequest?.requestId).toBe(2));
  });

  it("waits briefly for a better initial fix before using a coarse one", () => {
    vi.useFakeTimers();
    let onSuccess: PositionCallback = () => {};
    watchPosition.mockImplementation((success) => {
      onSuccess = success;
      return 6;
    });

    render(
      <CampusMap
        box={{ height: 448, width: 361 }}
        closestWidth={40}
        initialView={{ width: 300, xRatio: 0.5, yRatio: 0.5 }}
        isLit={() => true}
        onSelect={() => {}}
        places={[]}
        selectedId={null}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "내 위치 보기" }));
    act(() =>
      onSuccess({
        coords: { accuracy: 100, latitude: 35.8886615, longitude: 128.6121297 },
        timestamp: 1,
      } as GeolocationPosition),
    );

    expect(screen.getByTestId("campus-location-accuracy").tagName).toBe("circle");
    expect(screen.getByTestId("campus-location-radar")).toBeInTheDocument();
    expect(festivalMapSpy.props?.focusRequest).toBeNull();
    act(() => vi.advanceTimersByTime(9_999));
    expect(festivalMapSpy.props?.focusRequest).toBeNull();

    act(() => vi.advanceTimersByTime(1));
    expect(festivalMapSpy.props?.focusRequest?.requestId).toBe(1);
  });

  it("records the actual SVG point selected on the map", () => {
    let onSuccess: PositionCallback = () => {};
    watchPosition.mockImplementation((success) => {
      onSuccess = success;
      return 7;
    });

    render(
      <CampusMap
        box={{ height: 448, width: 361 }}
        closestWidth={40}
        initialView={{ width: 300, xRatio: 0.5, yRatio: 0.5 }}
        isLit={() => true}
        onSelect={() => {}}
        places={[]}
        selectedId={null}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "내 위치 보기" }));
    act(() =>
      onSuccess({
        coords: { accuracy: 4, latitude: 35.8886615, longitude: 128.6121297 },
        timestamp: 1,
      } as GeolocationPosition),
    );

    fireEvent.click(screen.getByRole("button", { name: "실제 위치 찍기" }));
    const selector = screen.getByRole("button", {
      name: "지도에서 실제 위치 선택",
    });
    vi.spyOn(selector, "getBoundingClientRect").mockReturnValue({
      bottom: 1128,
      height: 1128,
      left: 0,
      right: 976,
      top: 0,
      width: 976,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });

    fireEvent.click(selector, { clientX: 488, clientY: 564, detail: 1 });

    expect(screen.getByRole("img", { name: "실제 위치" })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "GPS 측정 기록" })).toHaveTextContent(
      "실제 SVGx 488.0 y 564.0",
    );
    expect(
      screen.getByRole("button", { name: "실제 위치 다시 찍기" }),
    ).toBeInTheDocument();
  });
});
