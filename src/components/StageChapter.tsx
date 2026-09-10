import type { Question, ResolvedObservation, Stage } from "../data/schema";
import { CapacityComparison } from "./CapacityComparison";
import { DataNeededCard } from "./DataNeededCard";
import { EvidenceCard } from "./EvidenceCard";

export function StageChapter({
  stage,
  observations,
  questions,
  index,
}: {
  stage: Stage;
  observations: ResolvedObservation[];
  questions: Question[];
  index: number;
}) {
  return (
    <section
      className={`stage-chapter stage-chapter--${stage.technology}`}
      id={stage.id}
      aria-labelledby={`${stage.id}-title`}
    >
      <header className="stage-chapter__header">
        <p className="stage-chapter__number">
          Stage {String(index + 1).padStart(2, "0")}
        </p>
        <div>
          <p className="eyebrow">
            {stage.technology === "c-si"
              ? "Crystalline silicon"
              : stage.technology === "cdte"
                ? "Alternative technology"
                : "Shared system"}
          </p>
          <h2 id={`${stage.id}-title`}>{stage.title}</h2>
          <p className="stage-chapter__summary">{stage.summary}</p>
        </div>
      </header>

      <div
        className="stage-chapter__flow"
        aria-label="Stage inputs and outputs"
      >
        <div>
          <span>Inputs</span>
          <p>{stage.inputs.join(" · ")}</p>
        </div>
        <span className="stage-chapter__arrow" aria-hidden="true">
          →
        </span>
        <div>
          <span>Outputs</span>
          <p>{stage.outputs.join(" · ")}</p>
        </div>
      </div>

      {observations.length ? (
        <div className="stage-chapter__evidence">
          <div className="section-label">
            <span>What the public evidence says</span>
            <span>
              {observations.length} sourced{" "}
              {observations.length === 1 ? "claim" : "claims"}
            </span>
          </div>
          <CapacityComparison observations={observations} />
          <div className="evidence-grid">
            {observations.map((observation) => (
              <EvidenceCard key={observation.id} observation={observation} />
            ))}
          </div>
        </div>
      ) : (
        <p className="stage-chapter__no-observation">
          We do not yet have a comparable public quantitative observation for
          this stage.
        </p>
      )}

      {questions.length ? (
        <div className="stage-chapter__questions">
          <div className="section-label">
            <span>What we still need</span>
            <span>
              {questions.length} open{" "}
              {questions.length === 1 ? "question" : "questions"}
            </span>
          </div>
          <div className="questions-grid">
            {questions.map((question) => (
              <DataNeededCard key={question.id} question={question} />
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
