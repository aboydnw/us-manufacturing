import { DataNeededCard } from "../components/DataNeededCard";
import type { Question, ResolvedSupplyMix } from "../data/schema";
import { buildSupplyRanking } from "../lib/supplyRanking";

interface Props {
  mix: ResolvedSupplyMix | null;
  question?: Question;
  onSelectCountry: (countryCode: string) => void;
}

function formatPercent(value: number | null) {
  if (value === null) return "Unknown";
  return `${new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 }).format(value)}%`;
}

export function SourceChart({ mix, question, onSelectCountry }: Props) {
  const ranking = buildSupplyRanking(mix);
  if (ranking.status === "unknown") {
    if (question) return <DataNeededCard question={question} />;
    return (
      <div className="source-chart__unknown">
        <strong>We need data for this. Do you know of any?</strong>
        <p>
          No complete, consistently defined country-supply series is currently
          available for this stage.
        </p>
      </div>
    );
  }
  if (!mix) return null;

  return (
    <figure className="source-chart" aria-labelledby="source-chart-title">
      <figcaption>
        <span id="source-chart-title">Combined source</span>
        <strong>
          {mix.denominatorValue.toLocaleString()} {mix.unit} · {mix.period} ·{" "}
          {ranking.originType} origin
        </strong>
      </figcaption>
      <ol>
        {ranking.rows.map((row) => {
          const percent = formatPercent(row.percentage);
          const contents = (
            <>
              <span>{row.label}</span>
              <span className="source-chart__track" aria-hidden="true">
                <span
                  style={{
                    width: `${Math.max(0, Math.min(100, row.percentage ?? 0))}%`,
                  }}
                />
              </span>
              <strong>{percent}</strong>
            </>
          );
          return (
            <li key={`${row.kind}-${row.code ?? row.label}`}>
              {row.kind === "country" && row.code ? (
                <button
                  type="button"
                  aria-label={`${row.label}, ${percent}`}
                  onClick={() => onSelectCountry(row.code!)}
                >
                  {contents}
                </button>
              ) : (
                <div>{contents}</div>
              )}
            </li>
          );
        })}
      </ol>
      <p className="source-chart__note">{mix.limitation}</p>
      <a href={mix.source.url} target="_blank" rel="noreferrer">
        {mix.source.title} <span aria-hidden="true">↗</span>
        <span className="sr-only"> (opens in a new tab)</span>
      </a>
    </figure>
  );
}
