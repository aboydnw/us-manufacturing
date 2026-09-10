import type { Source } from "../data/schema";

export function SourceDetails({ source }: { source: Source }) {
  return (
    <details className="source-details">
      <summary>Source &amp; method</summary>
      <dl>
        <div>
          <dt>Publisher</dt>
          <dd>{source.publisher}</dd>
        </div>
        <div>
          <dt>Source</dt>
          <dd>
            <a href={source.url} target="_blank" rel="noreferrer">
              {source.title}
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </dd>
        </div>
        <div>
          <dt>License</dt>
          <dd>
            {source.license_url ? (
              <a href={source.license_url} target="_blank" rel="noreferrer">
                {source.license}
              </a>
            ) : (
              source.license
            )}
          </dd>
        </div>
        <div>
          <dt>Verified</dt>
          <dd>{source.last_verified}</dd>
        </div>
      </dl>
    </details>
  );
}
