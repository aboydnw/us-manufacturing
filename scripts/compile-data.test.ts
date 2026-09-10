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
  options: { sourceId?: string; questionStageId?: string } = {},
) {
  const root = mkdtempSync(join(tmpdir(), "solar-data-"));
  mkdirSync(join(root, "data"));
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
  return root;
}

describe("compileData", () => {
  it("joins observations to their source records", () => {
    const data = compileData(fixture());
    expect(data.observations[0].source.source_id).toBe(
      "doe_pv_mfg_map_20260615",
    );
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
});
