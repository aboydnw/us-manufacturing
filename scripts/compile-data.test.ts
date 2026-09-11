import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { compileData } from "./compile-data";

const sourceHeader =
  "source_id,title,publisher,url,license,license_url,access,formats,geography,temporal_coverage,update_cadence,value_chain_stages,key_fields,questions_supported,known_limitations,ingest_priority,status,last_verified\n";
const sourceRow =
  "doe_pv_mfg_map_20260615,DOE map,DOE,https://example.com,Public domain,https://example.com/license,download,CSV,US,current,periodic,module,capacity,capacity,Nameplate only,P0,ready,2026-09-10\n";

function fixture(
  options: {
    sourceId?: string;
    questionStageId?: string;
    facilitySourceId?: string;
    facilityStageId?: string;
    supplyMixes?: unknown[];
  } = {},
) {
  const root = mkdtempSync(join(tmpdir(), "solar-data-"));
  mkdirSync(join(root, "data"));
  mkdirSync(join(root, "public/data"), { recursive: true });
  writeFileSync(
    join(root, "data/source-registry.csv"),
    sourceHeader + sourceRow,
  );
  writeFileSync(
    join(root, "data/stages.json"),
    JSON.stringify([
      {
        id: "modules",
        order: 1,
        technology: "c-si",
        title: "Modules",
        shortTitle: "Modules",
        summary: "Cells and materials become finished modules.",
        inputs: ["cells"],
        outputs: ["modules"],
      },
    ]),
  );
  writeFileSync(
    join(root, "data/observations.csv"),
    [
      "id,stage_id,source_id,metric,value,display_value,unit,geography,period,evidence_type,definition,limitation,calculation",
      `module-capacity,modules,${options.sourceId ?? "doe_pv_mfg_map_20260615"},module-nameplate,64.2,64.2 GWdc/year,GWdc/year,United States,2026-06-15,nameplate,Operating rated capacity,Nameplate is not output,Sum of active records`,
    ].join("\n"),
  );
  writeFileSync(
    join(root, "data/reference-system.json"),
    JSON.stringify({
      title: "100 MWdc reference installation",
      capacityMwDc: 100,
      configuration: "Single-axis tracking",
      inverterType: "Central inverter",
      benchmarkYear: 2025,
      sourceId: "doe_pv_mfg_map_20260615",
      components: [
        {
          id: "modules",
          label: "Modules",
          quantity: "166,667",
          origin: "Mixed",
        },
      ],
    }),
  );
  writeFileSync(
    join(root, "data/questions.json"),
    JSON.stringify([
      {
        id: "module-output",
        stageId: options.questionStageId ?? "modules",
        title: "actual module output",
        missingMeasure: "Annual output",
        usefulSourceWouldInclude: ["facility", "period", "output", "license"],
        issueLabel: "data-source",
      },
    ]),
  );
  writeFileSync(
    join(root, "data/facilities.csv"),
    [
      "id,source_id,name,company,stage_id,technology,facility_type,city,state,country_code,latitude,longitude,status,measure_type,measure_value,measure_unit,measure_period,source_url,limitation",
      `factory-one,${options.facilitySourceId ?? "doe_pv_mfg_map_20260615"},Factory One,Example Solar,${options.facilityStageId ?? "modules"},c-si,Module assembly,Mesa,Arizona,USA,33.4,-111.8,active,nameplate-capacity,2.5,GWdc/year,2026-06-15,https://example.com/factory-one,Nameplate is not output`,
    ].join("\n"),
  );
  writeFileSync(
    join(root, "data/supply-mixes.json"),
    JSON.stringify(options.supplyMixes ?? []),
  );
  writeFileSync(
    join(root, "public/data/countries.geojson"),
    JSON.stringify({
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: { code: "USA", name: "United States" },
          geometry: {
            type: "Polygon",
            coordinates: [
              [
                [-125, 25],
                [-66, 25],
                [-66, 49],
                [-125, 49],
                [-125, 25],
              ],
            ],
          },
        },
        {
          type: "Feature",
          properties: { code: "CHN", name: "China" },
          geometry: {
            type: "Polygon",
            coordinates: [
              [
                [73, 18],
                [135, 18],
                [135, 54],
                [73, 54],
                [73, 18],
              ],
            ],
          },
        },
      ],
    }),
  );
  return root;
}

function supplyMix(overrides: Record<string, unknown> = {}) {
  return {
    id: "module-supply-2025",
    stageId: "modules",
    product: "Crystalline-silicon modules",
    geography: "US market",
    period: "2025",
    measure: "actual-supply",
    unit: "GWdc",
    denominatorValue: 10,
    sourceId: "doe_pv_mfg_map_20260615",
    completeness: "complete",
    limitation: "Illustrative test fixture.",
    countries: [
      {
        countryCode: "USA",
        countryName: "United States",
        value: 4,
        originType: "direct",
      },
      {
        countryCode: "CHN",
        countryName: "China",
        value: 5,
        originType: "direct",
      },
    ],
    unknownOriginValue: 1,
    ...overrides,
  };
}

describe("compileData", () => {
  it("joins observations to their source records", () => {
    const data = compileData(fixture());
    expect(data.observations[0].source.source_id).toBe(
      "doe_pv_mfg_map_20260615",
    );
    expect(data.facilities[0].source.source_id).toBe("doe_pv_mfg_map_20260615");
    expect(data.supplyMixes).toEqual([]);
  });

  it("rejects an observation with an unknown source", () => {
    expect(() => compileData(fixture({ sourceId: "missing" }))).toThrow(
      /unknown source id/i,
    );
  });

  it("rejects a question with an unknown stage", () => {
    expect(() => compileData(fixture({ questionStageId: "missing" }))).toThrow(
      /unknown stage id/i,
    );
  });

  it("rejects a facility with an unknown source", () => {
    expect(() => compileData(fixture({ facilitySourceId: "missing" }))).toThrow(
      /unknown source id/i,
    );
  });

  it("rejects a facility with an unknown stage", () => {
    expect(() => compileData(fixture({ facilityStageId: "missing" }))).toThrow(
      /unknown stage id/i,
    );
  });

  it("rejects aggregate pseudo-countries in a supply mix", () => {
    const mix = supplyMix({
      countries: [
        {
          countryCode: "ROW",
          countryName: "Rest of world",
          value: 5,
          originType: "direct",
        },
      ],
    });
    expect(() => compileData(fixture({ supplyMixes: [mix] }))).toThrow(
      /aggregate regions/i,
    );
  });

  it("rejects mixed direct and upstream origins", () => {
    const mix = supplyMix({
      countries: [
        {
          countryCode: "USA",
          countryName: "United States",
          value: 4,
          originType: "direct",
        },
        {
          countryCode: "CHN",
          countryName: "China",
          value: 5,
          originType: "upstream",
        },
      ],
    });
    expect(() => compileData(fixture({ supplyMixes: [mix] }))).toThrow(
      /direct and upstream/i,
    );
  });

  it("rejects a supply mix with an unknown country code", () => {
    const mix = supplyMix({
      countries: [
        {
          countryCode: "ZZZ",
          countryName: "Nowhere",
          value: 5,
          originType: "direct",
        },
      ],
    });
    expect(() => compileData(fixture({ supplyMixes: [mix] }))).toThrow(
      /unknown country code/i,
    );
  });

  it("rejects known country values beyond the denominator", () => {
    const mix = supplyMix({ denominatorValue: 5 });
    expect(() => compileData(fixture({ supplyMixes: [mix] }))).toThrow(
      /denominator/i,
    );
  });
});
