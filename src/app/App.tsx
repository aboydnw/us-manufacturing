import { useSiteData } from "../data/useSiteData";
import type { Source } from "../data/schema";
import { ExplorerShell } from "../explorer/ExplorerShell";

function Header({ sources = [] }: { sources?: Source[] }) {
  return (
    <header className="app-header">
      <div className="app-brand" aria-hidden="true">
        <span className="app-brand__sun">✦</span>
        <span>Solar, made where?</span>
      </div>
      <h1>How dependent is a U.S. solar installation on other countries?</h1>
      <nav aria-label="Project information">
        <details>
          <summary>Method</summary>
          <div className="header-popover">
            <strong>Evidence before answers</strong>
            <p>
              Capacity, production, imports, modeled demand, and announcements
              remain separate. Missing evidence is shown as unknown—not zero.
            </p>
          </div>
        </details>
        <details>
          <summary>Sources</summary>
          <div className="header-popover header-popover--sources">
            <strong>{sources.length} reviewed sources</strong>
            <ul>
              {sources.map((source) => (
                <li key={source.source_id}>
                  <a href={source.url} target="_blank" rel="noreferrer">
                    {source.title}
                  </a>
                  <small>{source.license}</small>
                </li>
              ))}
            </ul>
          </div>
        </details>
        <a
          href="https://github.com/aboydnw/us-manufacturing"
          target="_blank"
          rel="noreferrer"
          aria-label="Open research repository"
        >
          <span className="research-link__wide">Open research</span>
          <span className="research-link__short" aria-hidden="true">
            Repo
          </span>{" "}
          ↗
        </a>
      </nav>
    </header>
  );
}

export function App() {
  const state = useSiteData();
  return (
    <>
      <a className="skip-link" href="#explorer">
        Skip to the explorer
      </a>
      <Header sources={state.status === "ready" ? state.data.sources : []} />
      {state.status === "loading" ? (
        <main className="app-status" aria-live="polite">
          Loading the evidence…
        </main>
      ) : null}
      {state.status === "error" ? (
        <main className="app-status app-status--error">
          <strong>The evidence file could not be loaded.</strong>
          <span>{state.error.message}</span>
        </main>
      ) : null}
      {state.status === "ready" ? <ExplorerShell data={state.data} /> : null}
    </>
  );
}
