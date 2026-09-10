import type { Stage } from "../data/schema";

function StageLinks({ stages }: { stages: Stage[] }) {
  return (
    <ol className="supply-chain-spine__list">
      {stages.map((stage, index) => (
        <li key={stage.id}>
          <a href={`#${stage.id}`}>
            <span className="supply-chain-spine__number">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span>{stage.shortTitle}</span>
          </a>
        </li>
      ))}
    </ol>
  );
}

export function SupplyChainSpine({ stages }: { stages: Stage[] }) {
  const primary = stages.filter((stage) => stage.technology !== "cdte");
  const cdte = stages.filter((stage) => stage.technology === "cdte");
  return (
    <nav className="supply-chain-spine" aria-label="Solar supply chain">
      <div className="supply-chain-spine__branch">
        <p>Crystalline silicon</p>
        <StageLinks stages={primary} />
      </div>
      {cdte.length ? (
        <div className="supply-chain-spine__branch supply-chain-spine__branch--cdte">
          <p>CdTe comparison</p>
          <StageLinks stages={cdte} />
        </div>
      ) : null}
    </nav>
  );
}
