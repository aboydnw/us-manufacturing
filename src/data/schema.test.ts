import { expect, it } from "vitest";
import { sourceFixture } from "../test/fixtures";
import { ObservationSchema, SiteDataSchema, SupplyMixSchema } from "./schema";

function siteDataFixture() {
  return {
    generatedAt: "2026-09-10T00:00:00.000Z",
    sources: [sourceFixture],
    stages: [
      {
        id: "modules",
        order: 1,
        technology: "c-si",
        title: "Modules",
        shortTitle: "Modules",
        summary: "Cells and materials become modules.",
        inputs: ["cells"],
        outputs: ["modules"],
      },
    ],
    observations: [],
    questions: [],
    facilities: [
      {
        id: "factory-one",
        sourceId: sourceFixture.source_id,
        name: "Factory One",
        company: "Example Solar",
        stageId: "modules",
        technology: "c-si",
        facilityType: "Module assembly",
        city: "Mesa",
        state: "Arizona",
        countryCode: "USA",
        latitude: 33.4,
        longitude: -111.8,
        status: "active",
        measureType: "nameplate-capacity",
        measureValue: 2.5,
        measureUnit: "GWdc/year",
        measurePeriod: "2026-06-15",
        sourceUrl: "https://example.com/factory-one",
        limitation: "Nameplate is not output.",
        source: sourceFixture,
      },
    ],
    supplyMixes: [],
    referenceSystem: {
      title: "Reference system",
      capacityMwDc: 100,
      configuration: "Single-axis tracking",
      inverterType: "Central inverter",
      benchmarkYear: 2025,
      sourceId: sourceFixture.source_id,
      components: [
        {
          id: "modules",
          label: "Modules",
          quantity: "166,667",
          origin: "Mixed",
        },
      ],
      source: sourceFixture,
    },
  };
}

it("rejects a negative capacity observation", () => {
  expect(() =>
    ObservationSchema.parse({
      id: "bad-capacity",
      stageId: "modules",
      sourceId: "source",
      metric: "module-nameplate",
      value: -1,
      displayValue: "-1 GWdc/year",
      unit: "GWdc/year",
      geography: "United States",
      period: "2026",
      evidenceType: "nameplate",
      definition: "Rated capacity",
      limitation: "Not production",
      calculation: null,
    }),
  ).toThrow();
});

it("requires compiled site data to include facility and supply-mix collections", () => {
  const data = siteDataFixture();
  const { facilities: _facilities, supplyMixes: _mixes, ...without } = data;
  expect(() => SiteDataSchema.parse(without)).toThrow();
});

it("accepts a facility whose comparable measure is explicitly unavailable", () => {
  const data = siteDataFixture();
  data.facilities[0].measureValue = null as unknown as number;
  data.facilities[0].measureUnit = "";
  expect(SiteDataSchema.parse(data).facilities[0].measureValue).toBeNull();
});

it("rejects a facility outside valid latitude and longitude bounds", () => {
  const data = siteDataFixture();
  data.facilities[0].latitude = 95;
  expect(() => SiteDataSchema.parse(data)).toThrow(/latitude/i);
});

it("rejects numeric facility measures without a unit", () => {
  const data = siteDataFixture();
  data.facilities[0].measureUnit = "";
  expect(() => SiteDataSchema.parse(data)).toThrow(/unit/i);
});

it("rejects capacity records described as production", () => {
  const data = siteDataFixture();
  data.facilities[0].measureType = "production";
  expect(() => SiteDataSchema.parse(data)).toThrow(/capacity/i);
});

it("accepts an empty supply-mix collection as an explicit unknown", () => {
  const parsed = SiteDataSchema.parse(siteDataFixture());
  expect(parsed.supplyMixes).toEqual([]);
});

const supplyMix = {
  id: "module-imports-2025",
  stageId: "modules",
  product: "Modules",
  geography: "US market" as const,
  period: "2025",
  measure: "imports" as const,
  unit: "USD",
  denominatorValue: 100,
  sourceId: sourceFixture.source_id,
  completeness: "complete" as const,
  limitation: "Customs value only.",
  countries: [
    {
      countryCode: "CHN",
      countryName: "China",
      value: 80,
      originType: "direct" as const,
    },
  ],
  unknownOriginValue: 20,
};

it("requires complete supply mixes to reconcile known and unknown origin values", () => {
  expect(() =>
    SupplyMixSchema.parse({ ...supplyMix, unknownOriginValue: 30 }),
  ).toThrow(/reconcile/i);
  expect(() =>
    SupplyMixSchema.parse({
      ...supplyMix,
      countries: [{ ...supplyMix.countries[0], value: 20 }],
      unknownOriginValue: 0,
    }),
  ).toThrow(/reconcile/i);
});

it("rejects duplicate country codes in a supply mix", () => {
  expect(() =>
    SupplyMixSchema.parse({
      ...supplyMix,
      countries: [
        ...supplyMix.countries,
        { ...supplyMix.countries[0], value: 0 },
      ],
    }),
  ).toThrow(/unique/i);
});

it("allows partial supply mixes to document incomplete coverage", () => {
  expect(
    SupplyMixSchema.parse({
      ...supplyMix,
      completeness: "partial",
      countries: [{ ...supplyMix.countries[0], value: 20 }],
      unknownOriginValue: null,
    }).completeness,
  ).toBe("partial");
});
