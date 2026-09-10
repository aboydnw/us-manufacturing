import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { SiteDataSchema, type SiteData } from "../src/data/schema";

export function checkContent(data: SiteData) {
  const sourceIds = new Set(data.sources.map((source) => source.source_id));
  for (const observation of data.observations) {
    if (!observation.period.trim()) {
      throw new Error(`Observation ${observation.id} is missing a period`);
    }
    if (!observation.limitation.trim()) {
      throw new Error(`Observation ${observation.id} is missing a limitation`);
    }
    if (observation.value !== null && !observation.unit.trim()) {
      throw new Error(`Observation ${observation.id} is missing a unit`);
    }
    if (!sourceIds.has(observation.sourceId)) {
      throw new Error(`Observation ${observation.id} has an unknown source`);
    }
  }

  for (const stage of data.stages) {
    const hasEvidence = data.observations.some(
      (observation) => observation.stageId === stage.id,
    );
    const hasQuestion = data.questions.some(
      (question) => question.stageId === stage.id,
    );
    if (!hasEvidence && !hasQuestion) {
      throw new Error(
        `Stage ${stage.id} needs evidence or a data question before publication`,
      );
    }
  }

  return true;
}

const currentFile = fileURLToPath(import.meta.url);
const invokedFile = process.argv[1] ? resolve(process.argv[1]) : "";
if (
  invokedFile &&
  pathToFileURL(invokedFile).href === pathToFileURL(currentFile).href
) {
  const rootDir = resolve(dirname(currentFile), "..");
  const data = SiteDataSchema.parse(
    JSON.parse(
      readFileSync(resolve(rootDir, "public/data/site-data.json"), "utf8"),
    ),
  );
  checkContent(data);
  console.log(
    `Content check passed: ${data.observations.length} observations, ${data.questions.length} open questions, ${data.sources.length} sources`,
  );
}
