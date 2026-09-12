import { render, screen } from "@testing-library/react";

import { CountdownSection } from "./CountdownSection";

const HOUR_MS = 60 * 60 * 1000;
const BASE = new Date("2026-09-12T00:00:00+09:00");

const renderAtHoursBeforeOpen = (hours: number) => {
  vi.setSystemTime(new Date(BASE.getTime() - hours * HOUR_MS));
  return render(<CountdownSection targetIso={BASE.toISOString()} />);
};

describe("CountdownSection", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date"] });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("shows the remaining time down to the second", () => {
    renderAtHoursBeforeOpen(5);

    expect(screen.getByLabelText("신청 시작까지 5시간 0분 0초 남음")).toHaveTextContent(
      "05:00:00",
    );
  });

  it("keeps the full timer size for 2-digit hours", () => {
    renderAtHoursBeforeOpen(5);

    expect(screen.getByLabelText(/신청 시작까지/).className).toContain("text-[90px]");
  });

  it("shrinks the timer once hours reach three digits", () => {
    renderAtHoursBeforeOpen(150);

    const timer = screen.getByLabelText(/신청 시작까지/);
    expect(timer).toHaveTextContent("150:00:00");
    expect(timer.className).toContain("text-[72px]");
  });

  it("shows a placeholder when the open time is unknown", () => {
    vi.setSystemTime(BASE);
    render(<CountdownSection />);

    expect(screen.getByText("--:--:--")).toBeInTheDocument();
    expect(screen.getByText("COUNTDOWN")).toBeInTheDocument();
  });
});
