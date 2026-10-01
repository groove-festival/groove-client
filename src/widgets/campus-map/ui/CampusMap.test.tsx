import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
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
const REGULAR_BROWSER_USER_AGENT = "Mozilla/5.0 Chrome/140.0.0.0 Mobile Safari/537.36";
const SAFARI_USER_AGENT =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 Version/18.6 Mobile/15E148 Safari/604.1";

beforeEach(() => {
  festivalMapSpy.props = null;
  Object.defineProperty(navigator, "userAgent", {
    configurable: true,
    value: REGULAR_BROWSER_USER_AGENT,
  });
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
  it("opens the browser notice on location click without requesting GPS inside a restricted app", () => {
    Object.defineProperty(navigator, "userAgent", {
      configurable: true,
      value: "Mozilla/5.0 Instagram 352.0.0.0 Mobile",
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

    expect(
      screen.queryByRole("dialog", { name: "GPS 기능 안내" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText("인스타그램, 에브리타임 인앱의 경우"),
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "내 위치 보기" }));

    expect(watchPosition).not.toHaveBeenCalled();
    const dialog = screen.getByRole("dialog", { name: "GPS 기능 안내" });
    expect(
      within(dialog).getByText("인스타그램, 에브리타임 인앱의 경우"),
    ).toBeInTheDocument();
    expect(
      within(dialog).getByText("GPS 기능을 사용할 수 없어요."),
    ).toBeInTheDocument();
    expect(
      within(dialog).getByText("크롬, 사파리등 브라우저로 접속해주세요."),
    ).toBeInTheDocument();
    expect(
      within(dialog).getByText("아이폰 iOS의 경우(사파리) 위치 허용 방법:"),
    ).toBeInTheDocument();
    expect(
      within(dialog).getByRole("button", { name: "주소 복사" }),
    ).toBeInTheDocument();

    fireEvent.click(within(dialog).getByRole("button", { name: "확인했습니다" }));
    expect(
      screen.queryByRole("dialog", { name: "GPS 기능 안내" }),
    ).not.toBeInTheDocument();
  });

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
    expect(screen.queryByText("이 범위 안 어딘가")).not.toBeInTheDocument();
    const marker = screen.getByRole("img", { name: "현재 위치" }).parentElement;
    const firstMarkerLeft = marker?.style.left;
    expect(marker).toHaveClass("duration-900", "ease-linear");

    act(() =>
      onSuccess({
        coords: { accuracy: 10, latitude: 35.88868, longitude: 128.61215 },
        timestamp: 1_001,
      } as GeolocationPosition),
    );

    await waitFor(() =>
      expect(
        screen.getByRole("img", { name: "현재 위치" }).parentElement?.style.left,
      ).not.toBe(firstMarkerLeft),
    );
    expect(festivalMapSpy.props?.focusRequest?.requestId).toBe(1);

    fireEvent.click(screen.getByRole("button", { name: "내 위치 보기" }));

    await waitFor(() => expect(festivalMapSpy.props?.focusRequest?.requestId).toBe(2));
  });

  it("shows the settings path below the map when Safari location permission is denied", () => {
    let onError: PositionErrorCallback = () => {};
    Object.defineProperty(navigator, "userAgent", {
      configurable: true,
      value: SAFARI_USER_AGENT,
    });
    watchPosition.mockImplementation((_success, error) => {
      onError = error ?? (() => {});
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

    expect(
      screen.queryByRole("complementary", { name: "Safari 위치 권한 설정 방법" }),
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "내 위치 보기" }));
    act(() => onError({ code: 1 } as GeolocationPositionError));

    expect(screen.getByRole("status")).toHaveTextContent("위치 권한을 허용해주세요");
    expect(
      screen.getByRole("complementary", { name: "Safari 위치 권한 설정 방법" }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "주소 복사" })).not.toBeInTheDocument();
  });

  it("does not show Safari settings after Chrome location permission is denied", () => {
    let onError: PositionErrorCallback = () => {};
    watchPosition.mockImplementation((_success, error) => {
      onError = error ?? (() => {});
      return 8;
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
    act(() => onError({ code: 1 } as GeolocationPositionError));

    expect(screen.getByRole("status")).toHaveTextContent("위치 권한을 허용해주세요");
    expect(
      screen.queryByRole("complementary", { name: "Safari 위치 권한 설정 방법" }),
    ).not.toBeInTheDocument();
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
});
