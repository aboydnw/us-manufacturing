import { expect, it } from "vitest";
import { HtsCrosswalkSchema } from "./htsCrosswalk";

function crosswalkFixture() {
  return {
    version: "2026.1",
    lastVerified: "2026-09-11",
    classificationSourceId: "usitc_cspv_5773",
    tradeDataSourceId: "census_trade_api",
    entries: [
      {
        id: "csi-cells-8541420010-2022",
        stageId: "cells",
        technology: "c-si",
        htsCode: "8541420010",
        description:
          "Crystalline silicon photovoltaic cells not assembled in modules or made up into panels",
        effectiveFrom: "2022-01-27",
        effectiveTo: null as string | null,
        tradeFlow: "imports-for-consumption",
        countryDimension: "individual-country",
        valueField: "CON_VAL_MO",
        quantityField: "CON_QY1_MO",
        unitField: "UNIT_QY1",
        preferredMeasure: "customs-value-usd",
        originType: "direct",
        includes: ["Crystalline-silicon photovoltaic cells"],
        excludes: ["Embedded upstream material origins"],
        limitation:
          "Country is direct import origin and does not identify embedded upstream origins.",
        classificationSourceUrl:
          "https://www.usitc.gov/publications/701_731/pub5631.pdf",
        validationSourceIds: ["usitc_cspv_5773"],
      },
      {
        id: "csi-modules-8541430010-2022",
        stageId: "modules",
        technology: "c-si",
        htsCode: "8541430010",
        description:
          "Crystalline silicon photovoltaic cells assembled in modules or made up into panels",
        effectiveFrom: "2022-01-27",
        effectiveTo: null as string | null,
        tradeFlow: "imports-for-consumption",
        countryDimension: "individual-country",
        valueField: "CON_VAL_MO",
        quantityField: "CON_QY1_MO",
        unitField: "UNIT_QY1",
        preferredMeasure: "customs-value-usd",
        originType: "direct",
        includes: ["Crystalline-silicon photovoltaic modules and panels"],
        excludes: ["Embedded upstream material origins"],
        limitation:
          "Country is direct import origin and does not identify embedded upstream origins.",
        classificationSourceUrl:
          "https://www.usitc.gov/publications/701_731/pub5631.pdf",
        validationSourceIds: ["usitc_cspv_5773"],
      },
    ],
  };
}

it("accepts the approved current cell and module classifications", () => {
  const parsed = HtsCrosswalkSchema.parse(crosswalkFixture());
  expect(parsed.entries.map((entry) => entry.htsCode)).toEqual([
    "8541420010",
    "8541430010",
  ]);
});

it("rejects an HTS statistical reporting number that is not ten digits", () => {
  const fixture = crosswalkFixture();
  fixture.entries[0].htsCode = "854142";
  expect(() => HtsCrosswalkSchema.parse(fixture)).toThrow(/ten digits/i);
});

it("rejects an effective period whose end is not later than its start", () => {
  const fixture = crosswalkFixture();
  fixture.entries[0].effectiveTo = "2022-01-27";
  expect(() => HtsCrosswalkSchema.parse(fixture)).toThrow(
    /effective end.*later/i,
  );
});

it("rejects duplicate stage, code, and effective-start classifications", () => {
  const fixture = crosswalkFixture();
  fixture.entries.push({ ...fixture.entries[0], id: "duplicate-entry" });
  expect(() => HtsCrosswalkSchema.parse(fixture)).toThrow(
    /duplicate classification/i,
  );
});
