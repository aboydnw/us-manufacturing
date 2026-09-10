import type { SiteData } from "../data/schema";
import { SourceDetails } from "./SourceDetails";

type ReferenceSystem = SiteData["referenceSystem"];

export function ReferenceInstallation({ system }: { system: ReferenceSystem }) {
  return (
    <section
      className="reference-installation"
      aria-labelledby="reference-title"
    >
      <div className="reference-installation__intro">
        <p className="eyebrow">The system we follow</p>
        <h2 id="reference-title">{system.title}</h2>
        <p>
          {system.configuration}, using a {system.inverterType.toLowerCase()}.
          The benchmark describes a physical system—not observed national
          purchasing.
        </p>
        <SourceDetails source={system.source} />
      </div>
      <ol className="reference-installation__components">
        {system.components.map((component) => (
          <li key={component.id}>
            <span>{component.label}</span>
            <strong>{component.quantity}</strong>
            <small>{component.origin}</small>
          </li>
        ))}
      </ol>
    </section>
  );
}
