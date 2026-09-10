import type { EvidenceType } from "../data/schema";

const labels: Record<EvidenceType, string> = {
  observed: "Observed",
  nameplate: "Reported nameplate",
  modeled: "Modeled",
  announced: "Announced or planned",
  unknown: "Data needed",
};

export function EvidenceBadge({ type }: { type: EvidenceType }) {
  return (
    <span className={`evidence-badge evidence-badge--${type}`} data-evidence={type}>
      {labels[type]}
    </span>
  );
}
