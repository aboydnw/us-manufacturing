import type {
  Question,
  ResolvedObservation,
  ResolvedSupplyMix,
  Stage,
} from "../data/schema";
import { EvidenceBadge } from "../components/EvidenceBadge";
import { SourceChart } from "./SourceChart";

interface Props {
  stage: Stage;
  observations: ResolvedObservation[];
  questions: Question[];
  supplyMix: ResolvedSupplyMix | null;
  onCountrySelect: (code: string) => void;
}

export function StageOverview({
  stage,
  observations,
  questions,
  supplyMix,
  onCountrySelect,
}: Props) {
  return (
    <div className="stage-overview">
      <p className="stage-overview__eyebrow">Stage {stage.order + 1}</p>
      <h2>{stage.title}</h2>
      <p className="stage-overview__summary">{stage.summary}</p>
      <div className="stage-overview__io">
        <div>
          <span>Inputs</span>
          <p>{stage.inputs.join(" · ")}</p>
        </div>
        <div>
          <span>Outputs</span>
          <p>{stage.outputs.join(" · ")}</p>
        </div>
      </div>
      {observations.length ? (
        <section
          className="stage-overview__evidence"
          aria-label="Known evidence"
        >
          <h3>What we can say</h3>
          {observations.map((observation) => (
            <article key={observation.id}>
              <EvidenceBadge type={observation.evidenceType} />
              <strong>{observation.displayValue}</strong>
              <span>{observation.metric.replaceAll("-", " ")}</span>
              <small>{observation.period}</small>
            </article>
          ))}
        </section>
      ) : null}
      <section className="stage-overview__source" aria-label="Country sourcing">
        <div className="section-heading">
          <p className="section-heading__eyebrow">Country dependence</p>
          <h3>
            {supplyMix?.measure === "imports"
              ? "Where do U.S. imports come from?"
              : "Where does U.S. supply come from?"}
          </h3>
        </div>
        <SourceChart
          mix={supplyMix}
          question={questions[0]}
          onSelectCountry={onCountrySelect}
        />
      </section>
    </div>
  );
}
