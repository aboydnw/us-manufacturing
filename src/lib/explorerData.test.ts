import { describe, expect, it } from "vitest";
import type { ResolvedSupplyMix } from "../data/schema";
import { facilityFixture, sourceFixture } from "../test/fixtures";
import {
  selectLatestSupplyMix,
  sortComparableFacilities,
} from "./explorerData";

const mix = (
  period: string,
  measure: ResolvedSupplyMix["measure"],
  product = "Modules",
): ResolvedSupplyMix => ({
  id: `modules-${measure}-${period}`,
  stageId: "modules",
  product,
  geography: "US market",
  period,
  measure,
  unit: "USD",
  denominatorValue: 100,
  sourceId: sourceFixture.source_id,
  completeness: "complete",
  limitation: "Fixture",
  countries: [
    {
      countryCode: "CHN",
      countryName: "China",
      value: 100,
      originType: "direct",
    },
  ],
  unknownOriginValue: null,
  source: sourceFixture,
});

describe("selectLatestSupplyMix", () => {
  it("selects the latest period independent of array order", () => {
    expect(
      selectLatestSupplyMix(
        [mix("2024", "imports"), mix("2025", "imports")],
        "modules",
      )?.period,
    ).toBe("2025");
  });

  it("does not mix product or measure scopes when filters are supplied", () => {
    expect(
      selectLatestSupplyMix(
        [mix("2026", "imports", "Cells"), mix("2025", "actual-supply")],
        "modules",
        { product: "Modules", measure: "actual-supply" },
      )?.period,
    ).toBe("2025");
  });
});

it("sorts only comparable facilities by value and leaves noncomparable records after them", () => {
  const result = sortComparableFacilities([
    facilityFixture({ id: "small", measureValue: 1 }),
    facilityFixture({
      id: "other-unit",
      measureValue: 10,
      measureUnit: "MW/year",
    }),
    facilityFixture({ id: "large", measureValue: 5 }),
    facilityFixture({ id: "missing", measureValue: null }),
  ]);
  expect(result.map((facility) => facility.id)).toEqual([
    "large",
    "small",
    "missing",
    "other-unit",
  ]);
});
