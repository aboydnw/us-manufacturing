import type { ResolvedObservation } from "../data/schema";

export function canCompare(
  first: ResolvedObservation,
  second: ResolvedObservation,
): { comparable: boolean; reason?: string } {
  if (first.unit !== second.unit) {
    return {
      comparable: false,
      reason: "These values use different units and require a documented conversion.",
    };
  }
  return { comparable: true };
}

export function CapacityComparison({
  observations,
}: {
  observations: ResolvedObservation[];
}) {
  const numeric = observations.filter(
    (observation): observation is ResolvedObservation & { value: number } =>
      observation.value !== null,
  );
  if (numeric.length < 2) return null;
  const comparison = canCompare(numeric[0], numeric[1]);
  if (!comparison.comparable) {
    return <p className="comparison-note">{comparison.reason}</p>;
  }
  const maximum = Math.max(...numeric.map((observation) => observation.value));
  return (
    <figure className="capacity-comparison">
      <figcaption>Comparable values</figcaption>
      {numeric.map((observation) => (
        <div className="capacity-comparison__row" key={observation.id}>
          <div className="capacity-comparison__labels">
            <span>{observation.definition}</span>
            <strong>{observation.displayValue}</strong>
          </div>
          <div className="capacity-comparison__track" aria-hidden="true">
            <span style={{ width: `${(observation.value / maximum) * 100}%` }} />
          </div>
        </div>
      ))}
    </figure>
  );
}
