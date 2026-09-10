import type { Question } from "../data/schema";
import { buildDataIssueUrl } from "../lib/githubIssue";
import { EvidenceBadge } from "./EvidenceBadge";

export function DataNeededCard({ question }: { question: Question }) {
  return (
    <article className="data-needed-card">
      <div className="data-needed-card__header">
        <EvidenceBadge type="unknown" />
        <span aria-hidden="true">?</span>
      </div>
      <h3>We need data for this. Do you know of any?</h3>
      <p className="data-needed-card__measure">{question.missingMeasure}</p>
      <p>
        A useful source would identify {question.usefulSourceWouldInclude.join(", ")}.
      </p>
      <a
        className="data-needed-card__link"
        href={buildDataIssueUrl(question)}
        target="_blank"
        rel="noreferrer"
      >
        Suggest a source
        <span aria-hidden="true"> ↗</span>
        <span className="sr-only"> (opens in a new tab)</span>
      </a>
    </article>
  );
}
