import type { Stage } from "../data/schema";

export function TechnologyBranch({ stage }: { stage: Stage }) {
  return (
    <aside
      className="technology-branch"
      aria-labelledby={`${stage.id}-branch-title`}
    >
      <p className="eyebrow">A different route through the chain</p>
      <h2 id={`${stage.id}-branch-title`}>CdTe changes the dependency story</h2>
      <p>{stage.summary}</p>
      <dl>
        <div>
          <dt>It skips</dt>
          <dd>
            Polysilicon, ingot, wafer, and separately traded c-Si cell stages
          </dd>
        </div>
        <div>
          <dt>It depends on</dt>
          <dd>{stage.inputs.join(", ")}</dd>
        </div>
      </dl>
    </aside>
  );
}
