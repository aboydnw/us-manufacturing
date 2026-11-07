import {
  mkdtempSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, expect, it, vi } from "vitest";
import type { HtsCrosswalkEntry } from "../src/data/htsCrosswalk";
import {
  buildCensusImportUrl,
  buildCountryIndex,
  buildSupplyMix,
  parseCensusResponse,
  importCensusTrade,
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

it("builds a keyed monthly Census query and trims build-secret whitespace", () => {
  const url = new URL(buildCensusImportUrl(entry, "2025-03", "  secret-key\n"));
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

const header = [
  "CTY_NAME",
  "CON_VAL_MO",
  "I_COMMODITY",
  "CTY_CODE",
  "SUMMARY_LVL",
  "CON_QY1_MO",
  "UNIT_QY1",
];
const detail = ["China", "120", "8541430010", "5700", "DET", "3", "NO"];

it.each([
  ["missing value", [[...detail.slice(0, 1), "", ...detail.slice(2)]]],
  ["short row", [detail.slice(0, -1)]],
  ["null cell", [[...detail.slice(0, 1), null, ...detail.slice(2)]]],
  ["missing country", [["", ...detail.slice(1)]]],
  ["missing country code", [[...detail.slice(0, 3), "", ...detail.slice(4)]]],
  ["missing summary level", [[...detail.slice(0, 4), "", ...detail.slice(5)]]],
  ["duplicate country", [detail, detail]],
  ["no data", []],
])("rejects %s instead of publishing a complete subset", (_name, rows) => {
  expect(() => parseCensusResponse([header, ...rows])).toThrow();
});

it("allows an explicit zero value and unavailable optional quantity", () => {
  expect(
    parseCensusResponse([
      header,
      ["China", "0", "8541430010", "5700", "DET", "", ""],
    ])[0],
  ).toMatchObject({ customsValueUsd: 0, quantity: null });
});

it("rejects duplicate headers and responses without detail data", () => {
  expect(() =>
    parseCensusResponse([
      [...header, "CTY_NAME"],
      [...detail, "China"],
    ]),
  ).toThrow(/duplicate columns/);
  expect(() =>
    parseCensusResponse([
      header,
      ["World", "120", "8541430010", "0000", "CGP", "3", "NO"],
    ]),
  ).toThrow(/no detail/);
});

it.each([
  { ...entry, effectiveFrom: "2025-01-02" },
  { ...entry, effectiveTo: "2025-12-31" },
])(
  "rejects a partial-year classification even when totals are positive",
  (partial) => {
    expect(() =>
      buildSupplyMix(
        partial,
        "2025",
        parseCensusResponse([header, detail]),
        buildCountryIndex(countries),
        "census_trade_api",
      ),
    ).toThrow(/full year/);
  },
);

it("accepts coverage ending at the exclusive start of the following year", () => {
  expect(
    buildSupplyMix(
      { ...entry, effectiveTo: "2026-01-01" },
      "2025",
      parseCensusResponse([header, detail]),
      buildCountryIndex(countries),
      "census_trade_api",
    ).denominatorValue,
  ).toBe(120);
});

const roots: string[] = [];
afterEach(() => {
  vi.unstubAllGlobals();
  for (const root of roots.splice(0))
    rmSync(root, { recursive: true, force: true });
});

function fixture(classification = entry) {
  const root = mkdtempSync(join(tmpdir(), "census-import-test-"));
  roots.push(root);
  mkdirSync(join(root, "data"));
  mkdirSync(join(root, "public/data"), { recursive: true });
  writeFileSync(
    join(root, "data/hts-crosswalk.json"),
    JSON.stringify({
      version: "2026.1",
      lastVerified: "2026-09-11",
      classificationSourceId: "usitc_cspv_5773",
      tradeDataSourceId: "census_trade_api",
      entries: [classification],
    }),
  );
  writeFileSync(
    join(root, "public/data/countries.geojson"),
    JSON.stringify(countries),
  );
  writeFileSync(join(root, "data/supply-mixes.json"), "[]\n");
  return root;
}

it("fetches all twelve months before atomically publishing annual totals", async () => {
  const root = fixture();
  const fetchMock = vi
    .fn()
    .mockImplementation(
      async () => new Response(JSON.stringify([header, detail])),
    );
  vi.stubGlobal("fetch", fetchMock);
  const mixes = await importCensusTrade(root, "2025", "test-key");
  expect(fetchMock).toHaveBeenCalledTimes(12);
  expect(
    fetchMock.mock.calls.map(([url]) => new URL(url).searchParams.get("time")),
  ).toEqual(
    Array.from(
      { length: 12 },
      (_, index) => `2025-${String(index + 1).padStart(2, "0")}`,
    ),
  );
  expect(mixes[0].denominatorValue).toBe(1440);
  expect(
    JSON.parse(readFileSync(join(root, "data/supply-mixes.json"), "utf8")),
  ).toEqual(mixes);
});

it("rejects partial-year coverage before any fetch or snapshot change", async () => {
  const root = fixture();
  const fetchMock = vi.fn();
  vi.stubGlobal("fetch", fetchMock);
  await expect(importCensusTrade(root, "2022", "test-key")).rejects.toThrow(
    /full year/,
  );
  expect(fetchMock).not.toHaveBeenCalled();
  expect(readFileSync(join(root, "data/supply-mixes.json"), "utf8")).toBe(
    "[]\n",
  );
});

it.each(["missing data", "http failure", "invalid key"])(
  "preserves the snapshot after a later month returns %s",
  async (failure) => {
    const root = fixture();
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response(JSON.stringify([header, detail])))
      .mockImplementation(async () => {
        if (failure === "http failure")
          return new Response("unavailable", { status: 503 });
        if (failure === "invalid key")
          return new Response("<html>Invalid key: test-key</html>");
        return new Response(
          JSON.stringify([header, ["China", "", ...detail.slice(2)]]),
        );
      });
    vi.stubGlobal("fetch", fetchMock);
    await expect(importCensusTrade(root, "2025", "test-key")).rejects.toThrow();
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(readFileSync(join(root, "data/supply-mixes.json"), "utf8")).toBe(
      "[]\n",
    );
  },
);

it("diagnoses non-JSON responses without exposing the Census key", async () => {
  const root = fixture();
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue(new Response("Invalid key: test-key")),
  );
  try {
    await importCensusTrade(root, "2025", "test-key");
    expect.fail("Expected import to fail");
  } catch (error) {
    expect(String(error)).toContain("verify CENSUS_API_KEY");
    expect(String(error)).not.toContain("test-key");
  }
});
