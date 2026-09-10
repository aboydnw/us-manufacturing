import type { Question } from "../data/schema";

const issueBase = "https://github.com/aboydnw/us-manufacturing/issues/new";

export function buildDataIssueUrl(question: Question) {
  const body = [
    `Missing measure: ${question.missingMeasure}`,
    "",
    "Source URL:",
    "",
    "Publisher:",
    "",
    "License or reuse terms:",
    "",
    "What the source measures:",
    "",
    "Why it fills this gap:",
    "",
    `A useful source would include: ${question.usefulSourceWouldInclude.join(", ")}`,
  ].join("\n");
  const params = new URLSearchParams({
    title: `Data source: ${question.title}`,
    body,
    labels: question.issueLabel,
  });
  return `${issueBase}?${params.toString()}`;
}
