import { fireEvent, render, screen } from "@testing-library/react";

import type { CampusLocationProjection } from "../model/georeference";
import { CampusLocationLog } from "./CampusLocationLog";

describe("CampusLocationLog", () => {
  it("shows the raw GPS reading and projected SVG point for a screenshot", () => {
    const timestamp = new Date(2026, 9, 1, 14, 3, 5, 7).getTime();
    const location = {
      point: { xRatio: 600.54 / 976, yRatio: 688.81 / 1128 },
    } as CampusLocationProjection;

    render(
      <CampusLocationLog
        actualPoint={null}
        isSelectingActualPoint={false}
        location={location}
        onStartActualPointSelection={() => {}}
        reading={{
          accuracy: 12.34,
          latitude: 35.8886615,
          longitude: 128.6121297,
          timestamp,
        }}
        sampleNumber={3}
      />,
    );

    const log = screen.getByRole("region", { name: "GPS 측정 기록" });
    expect(log).toHaveTextContent("GPS 측정 #3");
    expect(log).toHaveTextContent("14:03:05.007");
    expect(log).toHaveTextContent("35.8886615");
    expect(log).toHaveTextContent("128.6121297");
    expect(log).toHaveTextContent("± 12.3m");
    expect(log).toHaveTextContent("x 600.5 y 688.8");
    expect(log).toHaveTextContent("실제 SVG-");
  });

  it("shows the selected actual SVG point and its difference from GPS", () => {
    const onStartActualPointSelection = vi.fn();
    const location = {
      point: { xRatio: 600 / 976, yRatio: 680 / 1128 },
    } as CampusLocationProjection;

    render(
      <CampusLocationLog
        actualPoint={{ xRatio: 620 / 976, yRatio: 710 / 1128 }}
        isSelectingActualPoint={false}
        location={location}
        onStartActualPointSelection={onStartActualPointSelection}
        reading={{
          accuracy: 4,
          latitude: 35.8886,
          longitude: 128.6094,
          timestamp: 1,
        }}
        sampleNumber={8}
      />,
    );

    const log = screen.getByRole("region", { name: "GPS 측정 기록" });
    expect(log).toHaveTextContent("실제 SVGx 620.0 y 710.0");
    expect(log).toHaveTextContent("차이Δx 20.0 Δy 30.0");

    fireEvent.click(screen.getByRole("button", { name: "실제 위치 다시 찍기" }));
    expect(onStartActualPointSelection).toHaveBeenCalledTimes(1);
  });
});
