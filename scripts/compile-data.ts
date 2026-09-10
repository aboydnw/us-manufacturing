import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { parse } from "csv-parse/sync";
import {
  ObservationSchema,
  QuestionSchema,
  ReferenceSystemSchema,
  SiteDataSchema,
  SourceSchema,
  StageSchema,
  type SiteData,
} from "../src/data/schema";

function uniqueById(
  records: Array<{ id?: string; source_id?: string }>,
  label: string,
) {
  const ids = new Set<string>();
  for (const record of records) {
    const id = record.id ?? record.source_id;
    if (!id || ids.has(id)) throw new Error(`Duplicate ${label} id: ${id}`);
    ids.add(id);
  }
}

function readJson(path: string) {
  return JSON.parse(readFileSync(path, "utf8")) as unknown;
}

export function compileData(rootDir: string): SiteData {
  const dataDir = join(rootDir, "data");
  const sources = SourceSchema.array().parse(
    parse(readFileSync(join(dataDir, "source-registry.csv"), "utf8"), {
      columns: true,
      skip_empty_lines: true,
    }),
  );
  const stages = StageSchema.array().parse(
    readJson(join(dataDir, "stages.json")),
  );
  const observationRows = parse(
    readFileSync(join(dataDir, "observations.csv"), "utf8"),
    {
      columns: true,
      skip_empty_lines: true,
    },
  ) as Array<Record<string, string>>;
  const observations = ObservationSchema.array().parse(
    observationRows.map((row) => ({
      id: row.id,
      stageId: row.stage_id,
      sourceId: row.source_id,
      metric: row.metric,
      value: row.value,
      displayValue: row.display_value,
      unit: row.unit,
      geography: row.geography,
      period: row.period,
      evidenceType: row.evidence_type,
      definition: row.definition,
      limitation: row.limitation,
      calculation:
        row.calculation && row.calculation !== "null" ? row.calculation : null,
    })),
  );
  const questions = QuestionSchema.array().parse(
    readJson(join(dataDir, "questions.json")),
  );
  const referenceSystem = ReferenceSystemSchema.parse(
    readJson(join(dataDir, "reference-system.json")),
  );

  uniqueById(sources, "source");
  uniqueById(stages, "stage");
  uniqueById(observations, "observation");
  uniqueById(questions, "question");

  const sourceById = new Map(
    sources.map((source) => [source.source_id, source]),
  );
  const stageIds = new Set(stages.map((stage) => stage.id));
  const resolvedObservations = observations.map((observation) => {
    if (!stageIds.has(observation.stageId)) {
      throw new Error(`Unknown stage id: ${observation.stageId}`);
    }
    const source = sourceById.get(observation.sourceId);
    if (!source) throw new Error(`Unknown source id: ${observation.sourceId}`);
    return { ...observation, source };
  });

  for (const question of questions) {
    if (!stageIds.has(question.stageId)) {
      throw new Error(`Unknown stage id: ${question.stageId}`);
    }
  }

  const referenceSource = sourceById.get(referenceSystem.sourceId);
  if (!referenceSource) {
    throw new Error(`Unknown source id: ${referenceSystem.sourceId}`);
  }

  return SiteDataSchema.parse({
    generatedAt: `${sources
      .map((source) => source.last_verified)
      .toSorted()
      .at(-1)}T00:00:00.000Z`,
    sources,
    stages: stages.toSorted((a, b) => a.order - b.order),
    observations: resolvedObservations,
    questions,
    referenceSystem: { ...referenceSystem, source: referenceSource },
  });
}

export function writeCompiledData(rootDir: string) {
  const outputPath = join(rootDir, "public/data/site-data.json");
  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(
    outputPath,
    `${JSON.stringify(compileData(rootDir), null, 2)}\n`,
  );
  return outputPath;
}

const currentFile = fileURLToPath(import.meta.url);
const invokedFile = process.argv[1] ? resolve(process.argv[1]) : "";
if (
  invokedFile &&
  pathToFileURL(invokedFile).href === pathToFileURL(currentFile).href
) {
  const rootDir = resolve(dirname(currentFile), "..");
  console.log(`Compiled site data to ${writeCompiledData(rootDir)}`);
}
