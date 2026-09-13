import type { ResolvedFacility, ResolvedSupplyMix } from "../data/schema";

interface SupplyMixScope {
  product?: string;
  measure?: ResolvedSupplyMix["measure"];
}

export function selectLatestSupplyMix(
  mixes: ResolvedSupplyMix[],
  stageId: string,
  scope: SupplyMixScope = {},
) {
  return (
    mixes
      .filter(
        (mix) =>
          mix.stageId === stageId &&
          mix.completeness === "complete" &&
          (!scope.product || mix.product === scope.product) &&
          (!scope.measure || mix.measure === scope.measure),
      )
      .sort(
        (a, b) =>
          b.period.localeCompare(a.period, undefined, { numeric: true }) ||
          a.measure.localeCompare(b.measure) ||
          a.product.localeCompare(b.product) ||
          a.id.localeCompare(b.id),
      )[0] ?? null
  );
}

function comparisonKey(facility: ResolvedFacility) {
  return [
    facility.facilityType,
    facility.measureType,
    facility.measureUnit,
    facility.measurePeriod,
    facility.status,
  ].join("|");
}

export function sortComparableFacilities(facilities: ResolvedFacility[]) {
  const counts = new Map<string, number>();
  for (const facility of facilities) {
    if (facility.measureValue === null) continue;
    const key = comparisonKey(facility);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  const primaryKey = [...counts].sort(
    ([aKey, aCount], [bKey, bCount]) =>
      bCount - aCount || aKey.localeCompare(bKey),
  )[0]?.[0];
  return [...facilities].sort((a, b) => {
    const group = (facility: ResolvedFacility) =>
      comparisonKey(facility) !== primaryKey
        ? 2
        : facility.measureValue === null
          ? 1
          : 0;
    return (
      group(a) - group(b) ||
      (b.measureValue ?? 0) - (a.measureValue ?? 0) ||
      a.name.localeCompare(b.name) ||
      a.id.localeCompare(b.id)
    );
  });
}
