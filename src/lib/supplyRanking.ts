import type { ResolvedSupplyMix } from "../data/schema";

export interface SupplyRankingRow {
  kind: "country" | "rest" | "unknown";
  code: string | null;
  label: string;
  value: number | null;
  percentage: number | null;
}

type SupplyRanking =
  | { status: "unknown"; reason: "absent" | "incomplete" }
  | {
      status: "ready";
      rows: SupplyRankingRow[];
      originType: "direct" | "upstream";
    };

export function buildSupplyRanking(
  mix: ResolvedSupplyMix | null | undefined,
): SupplyRanking {
  if (!mix) return { status: "unknown", reason: "absent" };
  if (mix.completeness !== "complete") {
    return { status: "unknown", reason: "incomplete" };
  }

  const sorted = mix.countries
    .filter((country) => country.value !== null)
    .sort(
      (a, b) =>
        (b.value ?? 0) - (a.value ?? 0) ||
        a.countryName.localeCompare(b.countryName),
    );
  const topFive = sorted.slice(0, 5);
  const unitedStates = mix.countries.find(
    (country) => country.countryCode === "USA",
  );
  const displayed = topFive.some((country) => country.countryCode === "USA")
    ? topFive
    : [
        ...topFive,
        unitedStates ?? {
          countryCode: "USA",
          countryName: "United States",
          value: null,
          originType: mix.countries[0]?.originType ?? ("direct" as const),
        },
      ];
  const displayedCodes = new Set(
    displayed.map((country) => country.countryCode),
  );
  const restValue = mix.countries.reduce(
    (sum, country) =>
      displayedCodes.has(country.countryCode)
        ? sum
        : sum + (country.value ?? 0),
    0,
  );
  const percentage = (value: number | null) =>
    value === null ? null : (value / mix.denominatorValue) * 100;

  const rows: SupplyRankingRow[] = displayed.map((country) => ({
    kind: "country",
    code: country.countryCode,
    label: country.countryName,
    value: country.value,
    percentage: percentage(country.value),
  }));
  if (restValue > 0) {
    rows.push({
      kind: "rest",
      code: null,
      label: "Rest of world",
      value: restValue,
      percentage: percentage(restValue),
    });
  }
  if (mix.unknownOriginValue !== null && mix.unknownOriginValue > 0) {
    rows.push({
      kind: "unknown",
      code: null,
      label: "Unknown origin",
      value: mix.unknownOriginValue,
      percentage: percentage(mix.unknownOriginValue),
    });
  }

  return {
    status: "ready",
    rows,
    originType: mix.countries[0]?.originType ?? "direct",
  };
}
