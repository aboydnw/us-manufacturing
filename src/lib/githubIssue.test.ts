import { expect, it } from "vitest";
import type { Question } from "../data/schema";
import { buildDataIssueUrl } from "./githubIssue";

const question: Question = {
  id: "wafer-output",
  stageId: "wafers",
  title: "actual U.S. wafer output",
  missingMeasure: "Annual factory output and utilization",
  usefulSourceWouldInclude: ["facility", "period", "output", "unit", "license"],
  issueLabel: "data-source",
};

it("creates a prefilled issue with requested provenance fields", () => {
  const url = new URL(buildDataIssueUrl(question));
  expect(url.pathname).toBe("/aboydnw/us-manufacturing/issues/new");
  expect(url.searchParams.get("labels")).toBe("data-source");
  expect(url.searchParams.get("title")).toBe(
    "Data source: actual U.S. wafer output",
  );
  expect(url.searchParams.get("body")).toContain("License or reuse terms:");
  expect(url.searchParams.get("body")).toContain("Source URL:");
  expect(url.searchParams.get("body")).toContain("facility, period, output");
});
