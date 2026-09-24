import { clampScale, getContainSize, getFocusPosition } from "./mapGeometry";

// 이벤트 지도 기준값. 컨테이너는 393 폭 화면의 지도 박스, 원본은 배치도 SVG다.
const CONTAINER = { width: 361, height: 320 };
const SOURCE = { width: 976, height: 1128 };

describe("getContainSize", () => {
  it("fits the whole map inside the container", () => {
    const content = getContainSize(CONTAINER, SOURCE);

    // 세로가 더 빠듯해 높이에 맞춰지고, 가로는 원본 비율을 따른다.
    expect(content.height).toBeCloseTo(320, 5);
    expect(content.width).toBeCloseTo(276.88, 2);
  });

  it("fits by width when the container is the narrower side", () => {
    const content = getContainSize({ width: 200, height: 1000 }, SOURCE);

    expect(content.width).toBeCloseTo(200, 5);
    expect(content.height).toBeCloseTo(231.15, 2);
  });

  it("returns an empty size before the container is measured", () => {
    expect(getContainSize({ width: 0, height: 0 }, SOURCE)).toEqual({
      width: 0,
      height: 0,
    });
  });
});

describe("getFocusPosition", () => {
  const content = getContainSize(CONTAINER, SOURCE);

  it("puts the ratio point at the center of the container", () => {
    const { x, y } = getFocusPosition(
      CONTAINER,
      content,
      { xRatio: 0.6258, yRatio: 0.5852 },
      16,
    );

    // 위치를 되돌려 계산하면 다시 컨테이너 한가운데다.
    expect(x + 0.6258 * content.width * 16).toBeCloseTo(CONTAINER.width / 2, 5);
    expect(y + 0.5852 * content.height * 16).toBeCloseTo(CONTAINER.height / 2, 5);
  });

  it("centers the whole map at scale 1", () => {
    const { x, y } = getFocusPosition(
      CONTAINER,
      content,
      { xRatio: 0.5, yRatio: 0.5 },
      1,
    );

    expect(x).toBeCloseTo((CONTAINER.width - content.width) / 2, 5);
    expect(y).toBeCloseTo((CONTAINER.height - content.height) / 2, 5);
  });
});

describe("clampScale", () => {
  it("keeps the scale between the limits", () => {
    expect(clampScale(16, 8, 48)).toBe(16);
    expect(clampScale(2, 8, 48)).toBe(8);
    expect(clampScale(100, 8, 48)).toBe(48);
  });
});
