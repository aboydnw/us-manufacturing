import { expect, it } from "vitest";
import { facilityRadius, comparableFacilityUnit } from "./facilityMeasures";

it("scales circle area in proportion to a comparable facility measure", () => {
  const smallRadius = facilityRadius(25, 100);
  const largeRadius = facilityRadius(100, 100);
  expect(Math.PI * largeRadius ** 2).toBeCloseTo(
    Math.PI * smallRadius ** 2 * 4,
  );
});

it("uses a fixed symbol for missing values", () => {
  expect(facilityRadius(null, 100)).toBe(5);
});

it("returns a comparison unit only when all measured facilities agree", () => {
  expect(comparableFacilityUnit(["GWdc/year", "GWdc/year", ""])).toBe(
    "GWdc/year",
  );
  expect(comparableFacilityUnit(["GWdc/year", "tonnes/year"])).toBeNull();
});
