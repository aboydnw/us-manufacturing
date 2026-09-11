import { expect, it } from "vitest";
import type { HtsCrosswalkEntry } from "../src/data/htsCrosswalk";
import {
  buildCensusImportUrl,
  buildCountryIndex,
  buildSupplyMix,
  parseCensusResponse,
} from "./import-census-trade";

const entry: HtsCrosswalkEntry = {
  id: "csi-modules-8541430010-2022",
  stageId: "modules",
  technology: "c-si",
  htsCode: "8541430010",
  description:
    "Crystalline silicon photovoltaic cells assembled in modules or made up into panels",
  effectiveFrom: "2022-01-27",
  effectiveTo: null,
  tradeFlow: "imports-for-consumption",
  countryDimension: "individual-country",
  valueField: "CON_VAL_MO",
  quantityField: "CON_QY1_MO",
  unitField: "UNIT_QY1",
  preferredMeasure: "customs-value-usd",
  originType: "direct",
  includes: ["Crystalline-silicon photovoltaic modules"],
  excludes: ["Embedded upstream origins"],
  limitation: "Direct import origin only.",
  classificationSourceUrl: "https://example.com/classification",
  validationSourceIds: ["usitc_cspv_5773"],
};

const countries = {
  type: "FeatureCollection",
  features: [
    { properties: { code: "CHN", name: "China" } },
    { properties: { code: "KOR", name: "South Korea" } },
    { properties: { code: "VNM", name: "Vietnam" } },
  ],
};

it("builds a keyed monthly Census query for one approved HTS code", () => {
  const url = new URL(buildCensusImportUrl(entry, "2025-03", "secret-key"));
  expect(url.origin + url.pathname).toBe(
    "https://api.census.gov/data/timeseries/intltrade/imports/hs",
  );
  expect(url.searchParams.get("time")).toBe("2025-03");
  expect(url.searchParams.get("I_COMMODITY")).toBe("8541430010");
  expect(url.searchParams.get("CTY_CODE")).toBe("*");
  expect(url.searchParams.get("SUMMARY_LVL")).toBe("DET");
  expect(url.searchParams.get("key")).toBe("secret-key");
});

it("parses Census rows by header name and excludes non-detail records", () => {
  const rows = parseCensusResponse([
    [
      "CTY_NAME",
      "CON_VAL_MO",
      "I_COMMODITY",
      "CTY_CODE",
      "SUMMARY_LVL",
      "CON_QY1_MO",
      "UNIT_QY1",
    ],
    ["China", "120", "8541430010", "5700", "DET", "3", "NO"],
    ["World", "120", "8541430010", "0000", "CGP", "3", "NO"],
  ]);
  expect(rows).toEqual([
    {
      countryName: "China",
      censusCountryCode: "5700",
      htsCode: "8541430010",
      customsValueUsd: 120,
      quantity: 3,
      quantityUnit: "NO",
    },
  ]);
});

it("aggregates annual direct imports and resolves Census country aliases", () => {
  const index = buildCountryIndex(countries);
  const mix = buildSupplyMix(
    entry,
    "2025",
    [
      {
        countryName: "China",
        censusCountryCode: "5700",
        htsCode: "8541430010",
        customsValueUsd: 120,
        quantity: 3,
        quantityUnit: "NO",
      },
      {
        countryName: "China",
        censusCountryCode: "5700",
        htsCode: "8541430010",
        customsValueUsd: 80,
        quantity: 2,
        quantityUnit: "NO",
      },
      {
        countryName: "Korea, South",
        censusCountryCode: "5800",
        htsCode: "8541430010",
        customsValueUsd: 50,
        quantity: 1,
        quantityUnit: "NO",
      },
    ],
    index,
    "census_trade_api",
  );

  expect(mix.denominatorValue).toBe(250);
  expect(mix.unit).toBe("USD customs value");
  expect(mix.countries).toEqual([
    {
      countryCode: "CHN",
      countryName: "China",
      value: 200,
      originType: "direct",
    },
    {
      countryCode: "KOR",
      countryName: "South Korea",
      value: 50,
      originType: "direct",
    },
  ]);
});

it("rejects a positive import value whose country cannot be mapped", () => {
  const index = buildCountryIndex(countries);
  expect(() =>
    buildSupplyMix(
      entry,
      "2025",
      [
        {
          countryName: "Unmapped Republic",
          censusCountryCode: "9999",
          htsCode: "8541430010",
          customsValueUsd: 50,
          quantity: null,
          quantityUnit: "",
        },
      ],
      index,
      "census_trade_api",
    ),
  ).toThrow(/unmapped census country/i);
});
