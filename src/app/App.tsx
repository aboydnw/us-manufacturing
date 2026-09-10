import { EvidenceBadge } from "../components/EvidenceBadge";
import { ReferenceInstallation } from "../components/ReferenceInstallation";
import { StageChapter } from "../components/StageChapter";
import { SupplyChainSpine } from "../components/SupplyChainSpine";
import { TechnologyBranch } from "../components/TechnologyBranch";
import { useSiteData } from "../data/useSiteData";

const evidenceTypes = [
  ["observed", "Measured or reported for a completed period"],
  ["nameplate", "Maximum rated factory output—not production"],
  ["modeled", "An engineering estimate or scenario"],
  ["announced", "Planned activity that may not happen"],
  ["unknown", "No suitable public evidence found"],
] as const;

export function App() {
  const siteData = useSiteData();

  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to the story
      </a>
      <header className="site-header">
        <a
          className="wordmark"
          href="#top"
          aria-label="U.S. Solar Supply Chain home"
        >
          <span>US</span>
          <span>Solar / Supply</span>
        </a>
        <nav aria-label="Page sections">
          <a href="#chain">The chain</a>
          <a href="#breaks">Fragilities</a>
          <a href="#unknowns">Unknowns</a>
          <a href="#sources">Sources</a>
        </nav>
        <a
          className="header-github"
          href="https://github.com/aboydnw/us-manufacturing"
          target="_blank"
          rel="noreferrer"
        >
          Open research ↗
        </a>
      </header>

      <main id="main-content">
        <section className="hero" id="top">
          <div className="hero__kicker">
            <span>Research edition 01</span>
            <span>United States · 2026</span>
          </div>
          <div className="hero__title">
            <h1>
              How dependent is a U.S. solar installation on other countries?
            </h1>
            <p>
              “Made in America” can mean the final assembly happened here. We
              follow one solar plant backward—from the grid connection to the
              raw materials—to see what the public evidence can actually prove.
            </p>
          </div>
          <div className="hero__thesis">
            <span className="hero__marker" aria-hidden="true">
              01
            </span>
            <p>
              The United States has built substantial module assembly capacity.
              The chain narrows sharply at cells and wafers, while actual
              factory output and the origins hidden inside finished equipment
              remain largely unknown.
            </p>
          </div>
          <div
            className="hero__signal"
            aria-label="A simplified capacity signal"
          >
            <div>
              <span>Modules</span>
              <strong>≈64.2</strong>
              <small>GWdc/year nameplate</small>
            </div>
            <div>
              <span>Cells</span>
              <strong>13.6</strong>
              <small>GWdc/year nameplate</small>
            </div>
            <div>
              <span>Wafers</span>
              <strong>2.5</strong>
              <small>GWdc/year nameplate</small>
            </div>
            <div className="hero__unknown">
              <span>Actual output</span>
              <strong>?</strong>
              <small>not publicly known</small>
            </div>
          </div>
          <p className="hero__caption">
            DOE active-facility records, June 15, 2026. Rated capacity is not
            production.
          </p>
        </section>

        <section className="reading-key" aria-labelledby="reading-key-title">
          <div>
            <p className="eyebrow">Evidence before answers</p>
            <h2 id="reading-key-title">Five labels keep unlike facts apart.</h2>
          </div>
          <ul>
            {evidenceTypes.map(([type, description]) => (
              <li key={type}>
                <EvidenceBadge type={type} />
                <span>{description}</span>
              </li>
            ))}
          </ul>
        </section>

        {siteData.status === "loading" ? (
          <section className="loading-state" aria-live="polite">
            <span /> Loading the evidence ledger…
          </section>
        ) : null}

        {siteData.status === "error" ? (
          <section className="error-state" role="alert">
            <p className="eyebrow">The evidence ledger did not load</p>
            <h2>We cannot responsibly show the story without its sources.</h2>
            <p>{siteData.error.message}</p>
          </section>
        ) : null}

        {siteData.status === "ready" ? (
          <>
            <ReferenceInstallation system={siteData.data.referenceSystem} />

            <section
              className="chain-intro"
              id="chain"
              aria-labelledby="chain-title"
            >
              <div>
                <p className="eyebrow">Start at the beginning</p>
                <h2 id="chain-title">
                  A solar plant is a chain of transformations.
                </h2>
              </div>
              <p>
                Factory location, material origin, direct import origin, and
                corporate headquarters are four different facts. This view
                follows the physical process and preserves those distinctions.
              </p>
            </section>

            <SupplyChainSpine stages={siteData.data.stages} />

            <div className="stage-ledger">
              {siteData.data.stages.map((stage, index) => {
                const observations = siteData.data.observations.filter(
                  (observation) => observation.stageId === stage.id,
                );
                const questions = siteData.data.questions.filter(
                  (question) => question.stageId === stage.id,
                );
                return (
                  <div key={stage.id}>
                    {stage.technology === "cdte" ? (
                      <TechnologyBranch stage={stage} />
                    ) : null}
                    <StageChapter
                      stage={stage}
                      observations={observations}
                      questions={questions}
                      index={index}
                    />
                  </div>
                );
              })}
            </div>

            <section
              className="fragility-section"
              id="breaks"
              aria-labelledby="breaks-title"
            >
              <header>
                <p className="eyebrow">The current read</p>
                <h2 id="breaks-title">What breaks first?</h2>
                <p>
                  The evidence does not support one resilience score. It does
                  support three sharper conclusions.
                </p>
              </header>
              <ol>
                <li>
                  <span>01</span>
                  <div>
                    <h3>
                      The domestic chain is narrowest before module assembly.
                    </h3>
                    <p>
                      Rated module capacity is nearly five times rated cell
                      capacity and more than twenty-five times rated wafer
                      capacity in the same DOE facility file.
                    </p>
                  </div>
                </li>
                <li>
                  <span>02</span>
                  <div>
                    <h3>
                      Direct import country is only the visible last border.
                    </h3>
                    <p>
                      A cell or module arriving from Southeast Asia may still
                      contain a Chinese wafer, polysilicon, glass, frame, or
                      junction box. Customs data cannot see through those
                      layers.
                    </p>
                  </div>
                </li>
                <li>
                  <span>03</span>
                  <div>
                    <h3>
                      The least measured parts may be the most consequential.
                    </h3>
                    <p>
                      Inverter semiconductors, tracker controls, transformer
                      cores, and actual factory utilization sit outside the
                      strongest public solar datasets. “Unknown” is the honest
                      answer for now.
                    </p>
                  </div>
                </li>
              </ol>
            </section>

            <section
              className="unknowns-index"
              id="unknowns"
              aria-labelledby="unknowns-title"
            >
              <header>
                <p className="eyebrow">The public research agenda</p>
                <h2 id="unknowns-title">What we still do not know</h2>
                <p>
                  {siteData.data.questions.length} questions are open. If you
                  know a reusable source, each one links to a structured
                  contribution form.
                </p>
              </header>
              <ol>
                {siteData.data.questions.map((question, index) => (
                  <li key={question.id}>
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <a href={`#${question.stageId}`}>{question.title}</a>
                  </li>
                ))}
              </ol>
            </section>

            <section
              className="method-section"
              id="sources"
              aria-labelledby="sources-title"
            >
              <header>
                <p className="eyebrow">Inspect the evidence</p>
                <h2 id="sources-title">Method and sources</h2>
                <p>
                  Every source is tracked with its access method, reuse terms,
                  coverage, limitations, and last verification date. Sources
                  that lack permission stay reference-only.
                </p>
              </header>
              <div className="method-section__rules">
                <div>
                  <strong>No single domestic score</strong>
                  <span>Stages and evidence types stay separate.</span>
                </div>
                <div>
                  <strong>No announcements as output</strong>
                  <span>Operating, planned, and observed are distinct.</span>
                </div>
                <div>
                  <strong>No zeroes for unknowns</strong>
                  <span>Missing evidence remains visibly missing.</span>
                </div>
              </div>
              <div className="source-table-wrap">
                <table className="source-table">
                  <thead>
                    <tr>
                      <th>Source</th>
                      <th>Publisher</th>
                      <th>License / status</th>
                      <th>Verified</th>
                    </tr>
                  </thead>
                  <tbody>
                    {siteData.data.sources.map((source) => (
                      <tr key={source.source_id}>
                        <td>
                          <a href={source.url} target="_blank" rel="noreferrer">
                            {source.title} ↗
                          </a>
                        </td>
                        <td>{source.publisher}</td>
                        <td>
                          <span
                            className={`source-status source-status--${source.status}`}
                          >
                            {source.license}
                          </span>
                        </td>
                        <td>{source.last_verified}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="method-section__footer">
                Data snapshot compiled {siteData.data.generatedAt.slice(0, 10)}{" "}
                · Research and corrections are reviewed in public on GitHub.
              </p>
            </section>
          </>
        ) : null}
      </main>
      <footer className="site-footer">
        <span>U.S. Solar / Supply</span>
        <p>An open investigation into what “made here” actually means.</p>
        <a href="#top">Back to top ↑</a>
      </footer>
    </>
  );
}
