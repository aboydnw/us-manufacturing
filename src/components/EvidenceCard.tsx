import type { ResolvedObservation } from "../data/schema";
import { EvidenceBadge } from "./EvidenceBadge";
import { SourceDetails } from "./SourceDetails";

export function EvidenceCard({ observation }: { observation: ResolvedObservation }) {
  return (
    <article className="evidence-card">
      <div className="evidence-card__topline">
        <EvidenceBadge type={observation.evidenceType} />
        <span>{observation.period}</span>
      </div>
      <p className="evidence-card__value">{observation.displayValue}</p>
      <h3>{observation.definition}</h3>
      <p className="evidence-card__geography">{observation.geography}</p>
      <p className="evidence-card__limitation">{observation.limitation}</p>
      {observation.calculation ? (
        <p className="evidence-card__calculation">
          <strong>Calculation:</strong> {observation.calculation}
        </p>
      ) : null}
      <SourceDetails source={observation.source} />
    </article>
  );
}
