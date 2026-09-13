import { describe, expect, it } from "vitest";
import {
  buildFlowRecords,
  placeFlowEndpoint,
  resolveLabelCollisions,
  wrapProjectedX,
} from "./mapProjection";

const viewport = { left: 20, top: 20, right: 980, bottom: 580 };
const us = { x: 500, y: 300 };

describe("placeFlowEndpoint", () => {
  it("keeps a visible country at its projected location", () => {
    expect(placeFlowEndpoint({ x: 200, y: 160 }, us, viewport)).toEqual({
      x: 200,
      y: 160,
      offscreen: false,
      edge: null,
    });
  });

  it("places an offscreen East Asian origin on the Pacific edge", () => {
    expect(placeFlowEndpoint({ x: -300, y: 180 }, us, viewport)).toMatchObject({
      x: 20,
      offscreen: true,
      edge: "left",
    });
  });

  it("places an offscreen European origin on the Atlantic edge", () => {
    expect(placeFlowEndpoint({ x: 1300, y: 180 }, us, viewport)).toMatchObject({
      x: 980,
      offscreen: true,
      edge: "right",
    });
  });
});

it("selects the wrapped world copy closest to the current center", () => {
  expect(wrapProjectedX(1150, 1000, 100)).toBe(150);
  expect(wrapProjectedX(-150, 1000, 900)).toBe(850);
});

it("separates colliding edge labels while preserving their codes", () => {
  expect(
    resolveLabelCollisions(
      [
        { code: "CHN", x: 20, y: 100 },
        { code: "VNM", x: 20, y: 105 },
      ],
      24,
    ),
  ).toEqual([
    { code: "CHN", x: 20, y: 100 },
    { code: "VNM", x: 20, y: 124 },
  ]);
});

it("does not move labels on opposite viewport edges and keeps labels in bounds", () => {
  expect(
    resolveLabelCollisions(
      [
        { code: "LEFT", x: 20, y: 570, edge: "left" as const },
        { code: "RIGHT", x: 980, y: 575, edge: "right" as const },
        { code: "LEFT2", x: 20, y: 580, edge: "left" as const },
      ],
      26,
      { top: 20, bottom: 580 },
    ),
  ).toEqual([
    { code: "LEFT", x: 20, y: 554, edge: "left" },
    { code: "LEFT2", x: 20, y: 580, edge: "left" },
    { code: "RIGHT", x: 980, y: 575, edge: "right" },
  ]);
});

it("reduces spacing when an edge group cannot fit within vertical bounds", () => {
  const result = resolveLabelCollisions(
    [
      { code: "A", x: 20, y: 0, edge: "left" as const },
      { code: "B", x: 20, y: 1, edge: "left" as const },
      { code: "C", x: 20, y: 2, edge: "left" as const },
      { code: "D", x: 20, y: 3, edge: "left" as const },
    ],
    40,
    { top: 20, bottom: 100 },
  );

  expect(result.map((label) => label.code)).toEqual(["A", "B", "C", "D"]);
  expect(result[0]?.y).toBe(20);
  expect(result.at(-1)?.y).toBe(100);
  expect(result.every((label) => label.y >= 20 && label.y <= 100)).toBe(true);
});

it("creates flows only for individual foreign countries with values", () => {
  expect(
    buildFlowRecords([
      { countryCode: "USA", countryName: "United States", value: 4 },
      { countryCode: "CHN", countryName: "China", value: 5 },
      { countryCode: "ROW", countryName: "Rest of world", value: 2 },
      { countryCode: "VNM", countryName: "Vietnam", value: null },
      { countryCode: "CHN", countryName: "China", value: 5 },
    ]),
  ).toEqual([{ code: "CHN", name: "China", value: 5 }]);
});
