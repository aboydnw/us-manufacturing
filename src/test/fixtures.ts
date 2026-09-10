import type {
  Question,
  ResolvedObservation,
  Source,
  Stage,
} from "../data/schema";

export const sourceFixture: Source = {
  source_id: "doe_pv_mfg_map_20260615",
  title: "DOE Solar Manufacturing Map",
  publisher: "U.S. Department of Energy",
  url: "https://example.com/source",
  license: "U.S. federal public domain",
  license_url: "https://example.com/license",
  access: "direct download",
  formats: "CSV",
  geography: "United States",
  temporal_coverage: "2026",
  update_cadence: "periodic",
  value_chain_stages: "modules",
  key_fields: "capacity",
  questions_supported: "domestic capacity",
  known_limitations: "nameplate only",
  ingest_priority: "P0",
  status: "ready",
  last_verified: "2026-09-10",
};

export function stageFixture(overrides: Partial<Stage> = {}): Stage {
  return {
    id: "wafers",
    order: 2,
    technology: "c-si",
    title: "Ingots and wafers",
    shortTitle: "Wafers",
    summary: "Polysilicon is crystallized and sliced into wafers.",
    inputs: ["polysilicon"],
    outputs: ["wafer"],
    ...overrides,
  };
}

export function observationFixture(
  overrides: Partial<ResolvedObservation> = {},
): ResolvedObservation {
  return {
    id: "wafer-nameplate",
    stageId: "wafers",
    sourceId: sourceFixture.source_id,
    metric: "wafer-nameplate",
    value: 2.5,
    displayValue: "2.5 GWdc/year",
    unit: "GWdc/year",
    geography: "United States",
    period: "2026-06-15",
    evidenceType: "nameplate",
    definition: "Operating rated capacity",
    limitation: "Nameplate is not output",
    calculation: null,
    source: sourceFixture,
    ...overrides,
  };
}

export function questionFixture(overrides: Partial<Question> = {}): Question {
  return {
    id: "wafer-output",
    stageId: "wafers",
    title: "actual U.S. wafer output",
    missingMeasure: "Annual factory output and utilization",
    usefulSourceWouldInclude: ["facility", "period", "output", "license"],
    issueLabel: "data-source",
    ...overrides,
  };
}
