import { expect, it } from "vitest";
import compiledData from "../public/data/site-data.json";
import type { SiteData } from "../src/data/schema";
import { checkContent } from "./check-content";

function cloneData() {
  return structuredClone(compiledData) as SiteData;
}

it("rejects a quantitative claim without a period", () => {
  const data = cloneData();
  data.observations[0].period = "";
  expect(() => checkContent(data)).toThrow(/period/i);
});

it("rejects a quantitative claim without a limitation", () => {
  const data = cloneData();
  data.observations[0].limitation = "";
  expect(() => checkContent(data)).toThrow(/limitation/i);
});

it("requires evidence or a contribution question for every stage", () => {
  const data = cloneData();
  data.observations = data.observations.filter(
    (observation) => observation.stageId !== "raw-materials",
  );
  data.questions = data.questions.filter(
    (question) => question.stageId !== "raw-materials",
  );
  expect(() => checkContent(data)).toThrow(/data question/i);
});

it("accepts the compiled publication data", () => {
  expect(() => checkContent(cloneData())).not.toThrow();
});

it("rejects a facility whose provenance no longer resolves", () => {
  const data = cloneData();
  data.facilities[0].sourceId = "missing-source";
  expect(() => checkContent(data)).toThrow(/facility.*unknown source/i);
});
