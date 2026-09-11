import { readFileSync, writeFileSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { parse } from "csv-parse/sync";
import { open } from "shapefile";

export interface DoeFacilityRow {
  title: string;
  sector: string;
  subsector: string;
  url: string;
  latitude: string;
  longitude: string;
  facility_type: string;
  large: string;
  name: string;
  capacity: string;
  state: string;
  city: string;
  manufacturing: string;
}

interface NormalizedFacility {
  id: string;
  sourceId: string;
  name: string;
  company: string;
  stageId: string;
  technology: "shared" | "c-si" | "cdte";
  facilityType: string;
  city: string;
  state: string;
  countryCode: "USA";
  latitude: number;
  longitude: number;
  status: "active";
  measureType: "nameplate-capacity";
  measureValue: number | null;
  measureUnit: string;
  measurePeriod: "2026-06-15";
  sourceUrl: string;
  limitation: string;
}

const DOE_SOURCE_ID = "doe_pv_mfg_map_20260615";
const DOE_SOURCE_URL =
  "https://www.energy.gov/cmei/systems/articles/us-domestic-solar-photovoltaic-manufacturing-map-data";

function slug(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function classify(row: DoeFacilityRow) {
  if (row.sector === "Silicon" || row.sector === "Polysilicon") {
    return { stageId: "silicon", technology: "c-si" as const };
  }
  if (row.sector === "Wafers") {
    return { stageId: "wafers", technology: "c-si" as const };
  }
  if (row.sector === "Cells") {
    return { stageId: "cells", technology: "c-si" as const };
  }
  if (row.sector === "Modules") {
    return row.subsector === "CdTe"
      ? { stageId: "cdte", technology: "cdte" as const }
      : { stageId: "modules", technology: "c-si" as const };
  }
  if (row.sector === "Components") {
    return { stageId: "modules", technology: "shared" as const };
  }
  if (row.sector === "S-BOS") {
    return { stageId: "structures", technology: "shared" as const };
  }
  if (row.sector === "Inverters") {
    return { stageId: "inverters", technology: "shared" as const };
  }
  if (row.sector === "E-BOS") {
    return row.subsector === "tracker components"
      ? { stageId: "structures", technology: "shared" as const }
      : { stageId: "electrical", technology: "shared" as const };
  }
  return null;
}

function comparableMeasure(row: DoeFacilityRow) {
  const numeric = Number(row.capacity.match(/^([\d.]+)/)?.[1]);
  if (!Number.isFinite(numeric) || numeric <= 0) {
    return { measureValue: null, measureUnit: "" };
  }

  if (["Wafers", "Cells", "Modules", "S-BOS"].includes(row.sector)) {
    if (row.capacity.endsWith("MWdc/yr")) {
      return { measureValue: numeric / 1000, measureUnit: "GWdc/year" };
    }
  }
  if (row.sector === "Inverters" && row.capacity.endsWith("MWac/yr")) {
    return { measureValue: numeric / 1000, measureUnit: "GWac/year" };
  }
  if (
    ["Silicon", "Polysilicon"].includes(row.sector) &&
    row.capacity.endsWith("kt/yr")
  ) {
    return { measureValue: numeric * 1000, measureUnit: "tonnes/year" };
  }
  return { measureValue: null, measureUnit: "" };
}

export function normalizeDoeFacilities(
  rows: DoeFacilityRow[],
): NormalizedFacility[] {
  const seenIds = new Map<string, number>();
  const facilities: NormalizedFacility[] = [];

  for (const row of rows) {
    if (row.manufacturing !== "TRUE") continue;
    const classification = classify(row);
    if (!classification) continue;
    const latitude = Number(row.latitude);
    const longitude = Number(row.longitude);
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) continue;

    const baseId = slug(`${row.name}-${row.city}-${row.state}`);
    const idCount = (seenIds.get(baseId) ?? 0) + 1;
    seenIds.set(baseId, idCount);
    const id = idCount === 1 ? baseId : `${baseId}-${idCount}`;
    const measure = comparableMeasure(row);

    facilities.push({
      id,
      sourceId: DOE_SOURCE_ID,
      name: row.name.trim(),
      company: row.title.trim(),
      ...classification,
      facilityType: `${row.sector}: ${row.subsector}`,
      city: row.city.trim(),
      state: row.state.trim(),
      countryCode: "USA",
      latitude,
      longitude,
      status: "active",
      measureType: "nameplate-capacity",
      ...measure,
      measurePeriod: "2026-06-15",
      sourceUrl: DOE_SOURCE_URL,
      limitation: measure.measureValue
        ? "DOE-reported annual nameplate capacity; not observed production, utilization, or domestic market supply."
        : `DOE reports ${row.capacity || "no comparable capacity"}; this product is not sized against other facilities in the stage.`,
    });
  }

  return facilities.toSorted((a, b) => a.id.localeCompare(b.id));
}

function csvCell(value: unknown) {
  const text = value === null || value === undefined ? "" : String(value);
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function facilitiesCsv(facilities: NormalizedFacility[]) {
  const columns: Array<keyof NormalizedFacility> = [
    "id",
    "sourceId",
    "name",
    "company",
    "stageId",
    "technology",
    "facilityType",
    "city",
    "state",
    "countryCode",
    "latitude",
    "longitude",
    "status",
    "measureType",
    "measureValue",
    "measureUnit",
    "measurePeriod",
    "sourceUrl",
    "limitation",
  ];
  const header = columns.map((column) =>
    column.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`),
  );
  return [
    header.join(","),
    ...facilities.map((facility) =>
      columns.map((column) => csvCell(facility[column])).join(","),
    ),
  ].join("\n");
}

async function convertStates(shpPath: string) {
  const dbfPath = join(dirname(shpPath), basename(shpPath, ".shp") + ".dbf");
  const source = await open(shpPath, dbfPath);
  const features = [];
  for (;;) {
    const result = await source.read();
    if (result.done) break;
    const feature = result.value;
    features.push({
      type: "Feature",
      properties: {
        code: String(feature.properties?.STUSPS ?? ""),
        name: String(feature.properties?.NAME ?? ""),
      },
      geometry: feature.geometry,
    });
  }
  return { type: "FeatureCollection", features };
}

function convertCountries(path: string) {
  const collection = JSON.parse(readFileSync(path, "utf8")) as {
    features: Array<{
      type: "Feature";
      properties: Record<string, unknown>;
      geometry: unknown;
    }>;
  };
  return {
    type: "FeatureCollection",
    features: collection.features
      .map((feature) => ({
        type: "Feature",
        properties: {
          code: String(feature.properties.ADM0_A3 ?? ""),
          name: String(feature.properties.NAME ?? ""),
        },
        geometry: feature.geometry,
      }))
      .filter((feature) => /^[A-Z]{3}$/.test(feature.properties.code))
      .toSorted((a, b) => a.properties.code.localeCompare(b.properties.code)),
  };
}

async function main() {
  const [doePath, countriesPath, statesShpPath] = process.argv.slice(2);
  if (!doePath || !countriesPath || !statesShpPath) {
    throw new Error(
      "Usage: prepare-map-data <doe.csv> <natural-earth.geojson> <census-states.shp>",
    );
  }
  const currentFile = fileURLToPath(import.meta.url);
  const rootDir = resolve(dirname(currentFile), "..");
  const rows = parse(readFileSync(doePath, "utf8"), {
    columns: true,
    skip_empty_lines: true,
    bom: true,
  }) as DoeFacilityRow[];

  writeFileSync(
    join(rootDir, "data/facilities.csv"),
    `${facilitiesCsv(normalizeDoeFacilities(rows))}\n`,
  );
  writeFileSync(
    join(rootDir, "public/data/countries.geojson"),
    `${JSON.stringify(convertCountries(countriesPath))}\n`,
  );
  writeFileSync(
    join(rootDir, "public/data/us-states.geojson"),
    `${JSON.stringify(await convertStates(statesShpPath))}\n`,
  );
}

const currentFile = fileURLToPath(import.meta.url);
if (
  process.argv[1] &&
  pathToFileURL(resolve(process.argv[1])).href ===
    pathToFileURL(currentFile).href
) {
  await main();
}
