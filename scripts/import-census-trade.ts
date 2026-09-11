import { readFileSync, renameSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { SupplyMixSchema, type SupplyMix } from "../src/data/schema";
import {
  HtsCrosswalkSchema,
  type HtsCrosswalkEntry,
} from "../src/data/htsCrosswalk";

const CENSUS_IMPORTS_URL =
  "https://api.census.gov/data/timeseries/intltrade/imports/hs";

const censusCountryAliases = new Map([
  ["korea south", "south korea"],
  ["russia", "russian federation"],
  ["taiwan", "taiwan"],
  ["vietnam", "vietnam"],
]);

export interface CensusImportRow {
  countryName: string;
  censusCountryCode: string;
  htsCode: string;
  customsValueUsd: number;
  quantity: number | null;
  quantityUnit: string;
}

interface CountryFeatureCollection {
  features: Array<{ properties?: { code?: string; name?: string } }>;
}

function normalizedCountryName(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function buildCountryIndex(collection: CountryFeatureCollection) {
  return new Map(
    collection.features.flatMap((feature) => {
      const { code, name } = feature.properties ?? {};
      return code && name
        ? [[normalizedCountryName(name), { code, name }] as const]
        : [];
    }),
  );
}

export function buildCensusImportUrl(
  entry: HtsCrosswalkEntry,
  month: string,
  apiKey: string,
) {
  const url = new URL(CENSUS_IMPORTS_URL);
  url.searchParams.set(
    "get",
    [
      "CTY_NAME",
      "I_COMMODITY",
      entry.valueField,
      entry.quantityField,
      entry.unitField,
      "SUMMARY_LVL",
    ].join(","),
  );
  url.searchParams.set("time", month);
  url.searchParams.set("I_COMMODITY", entry.htsCode);
  url.searchParams.set("CTY_CODE", "*");
  url.searchParams.set("SUMMARY_LVL", "DET");
  url.searchParams.set("key", apiKey);
  return url.toString();
}

function parseOptionalNumber(value: string) {
  if (!value.trim()) return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new Error(`Invalid Census numeric value: ${value}`);
  }
  return parsed;
}

export function parseCensusResponse(payload: unknown): CensusImportRow[] {
  if (!Array.isArray(payload) || !payload.every(Array.isArray)) {
    throw new Error("Census response must be a table");
  }
  const [rawHeader, ...rawRows] = payload as string[][];
  if (!rawHeader) throw new Error("Census response is empty");
  const column = new Map(rawHeader.map((name, index) => [name, index]));
  const required = [
    "CTY_NAME",
    "CTY_CODE",
    "I_COMMODITY",
    "CON_VAL_MO",
    "CON_QY1_MO",
    "UNIT_QY1",
    "SUMMARY_LVL",
  ];
  for (const name of required) {
    if (!column.has(name))
      throw new Error(`Census response is missing ${name}`);
  }
  const value = (row: string[], name: string) => row[column.get(name)!] ?? "";

  return rawRows.flatMap((row) => {
    if (value(row, "SUMMARY_LVL") !== "DET") return [];
    const customsValueUsd = parseOptionalNumber(value(row, "CON_VAL_MO"));
    if (customsValueUsd === null) return [];
    return [
      {
        countryName: value(row, "CTY_NAME").trim(),
        censusCountryCode: value(row, "CTY_CODE").trim(),
        htsCode: value(row, "I_COMMODITY").trim(),
        customsValueUsd,
        quantity: parseOptionalNumber(value(row, "CON_QY1_MO")),
        quantityUnit: value(row, "UNIT_QY1").trim(),
      },
    ];
  });
}

export function buildSupplyMix(
  entry: HtsCrosswalkEntry,
  period: string,
  rows: CensusImportRow[],
  countryIndex: ReturnType<typeof buildCountryIndex>,
  sourceId: string,
): SupplyMix {
  const totals = new Map<
    string,
    { countryCode: string; countryName: string; value: number }
  >();
  for (const row of rows) {
    if (row.htsCode !== entry.htsCode) {
      throw new Error(
        `Census response returned HTS ${row.htsCode} for ${entry.htsCode}`,
      );
    }
    if (row.customsValueUsd <= 0) continue;
    const censusName = normalizedCountryName(row.countryName);
    const mapName = censusCountryAliases.get(censusName) ?? censusName;
    const country = countryIndex.get(mapName);
    if (!country) {
      throw new Error(
        `Unmapped Census country: ${row.countryName} (${row.censusCountryCode})`,
      );
    }
    const current = totals.get(country.code);
    totals.set(country.code, {
      countryCode: country.code,
      countryName: country.name,
      value: (current?.value ?? 0) + row.customsValueUsd,
    });
  }

  const countries = [...totals.values()]
    .sort(
      (a, b) => b.value - a.value || a.countryName.localeCompare(b.countryName),
    )
    .map((country) => ({ ...country, originType: "direct" as const }));
  const denominatorValue = countries.reduce(
    (total, country) => total + country.value,
    0,
  );
  if (denominatorValue <= 0) {
    throw new Error(`No positive Census import values for ${entry.htsCode}`);
  }

  return SupplyMixSchema.parse({
    id: `${entry.id}-${period}`,
    stageId: entry.stageId,
    product: entry.description,
    geography: "US market",
    period,
    measure: "imports",
    unit: "USD customs value",
    denominatorValue,
    sourceId,
    completeness: "complete",
    limitation: `${entry.limitation} Aggregated from monthly U.S. imports for consumption under HTS ${entry.htsCode}; customs value is not physical volume.`,
    countries,
    unknownOriginValue: 0,
  });
}

function monthsForYear(year: string) {
  if (!/^\d{4}$/.test(year)) throw new Error("Year must use YYYY format");
  return Array.from(
    { length: 12 },
    (_, index) => `${year}-${String(index + 1).padStart(2, "0")}`,
  );
}

function isActiveForYear(entry: HtsCrosswalkEntry, year: string) {
  const start = `${year}-01-01`;
  const end = `${Number(year) + 1}-01-01`;
  return (
    entry.effectiveFrom < end &&
    (!entry.effectiveTo || entry.effectiveTo > start)
  );
}

export async function importCensusTrade(
  rootDir: string,
  year: string,
  apiKey: string,
) {
  if (!apiKey.trim()) {
    throw new Error("CENSUS_API_KEY is required for Census trade imports");
  }
  const dataDir = join(rootDir, "data");
  const crosswalk = HtsCrosswalkSchema.parse(
    JSON.parse(readFileSync(join(dataDir, "hts-crosswalk.json"), "utf8")),
  );
  const countryIndex = buildCountryIndex(
    JSON.parse(
      readFileSync(join(rootDir, "public/data/countries.geojson"), "utf8"),
    ) as CountryFeatureCollection,
  );
  const entries = crosswalk.entries.filter((entry) =>
    isActiveForYear(entry, year),
  );
  if (!entries.length) throw new Error(`No active HTS entries for ${year}`);

  const generated: SupplyMix[] = [];
  for (const entry of entries) {
    const rows: CensusImportRow[] = [];
    for (const month of monthsForYear(year)) {
      const response = await fetch(buildCensusImportUrl(entry, month, apiKey));
      if (!response.ok) {
        throw new Error(
          `Census request failed for ${entry.htsCode} in ${month}: HTTP ${response.status}`,
        );
      }
      rows.push(...parseCensusResponse(await response.json()));
    }
    generated.push(
      buildSupplyMix(
        entry,
        year,
        rows,
        countryIndex,
        crosswalk.tradeDataSourceId,
      ),
    );
  }

  const outputPath = join(dataDir, "supply-mixes.json");
  const existing = SupplyMixSchema.array().parse(
    JSON.parse(readFileSync(outputPath, "utf8")),
  );
  const generatedIds = new Set(generated.map((mix) => mix.id));
  const output = [
    ...existing.filter((mix) => !generatedIds.has(mix.id)),
    ...generated,
  ];
  const temporaryPath = `${outputPath}.tmp`;
  writeFileSync(temporaryPath, `${JSON.stringify(output, null, 2)}\n`);
  renameSync(temporaryPath, outputPath);
  return output;
}

const currentFile = fileURLToPath(import.meta.url);
const invokedFile = process.argv[1] ? resolve(process.argv[1]) : "";
if (
  invokedFile &&
  pathToFileURL(invokedFile).href === pathToFileURL(currentFile).href
) {
  const yearIndex = process.argv.indexOf("--year");
  const year = yearIndex >= 0 ? process.argv[yearIndex + 1] : undefined;
  if (!year) throw new Error("Usage: yarn data:imports --year YYYY");
  const rootDir = resolve(dirname(currentFile), "..");
  const mixes = await importCensusTrade(
    rootDir,
    year,
    process.env.CENSUS_API_KEY ?? "",
  );
  console.log(`Wrote ${mixes.length} supply mixes for ${year}`);
}
