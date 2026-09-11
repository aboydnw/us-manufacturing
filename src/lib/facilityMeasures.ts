export function facilityRadius(
  value: number | null,
  maximum: number,
  maximumRadius = 24,
) {
  if (value === null || value <= 0 || maximum <= 0) return 5;
  return Math.max(5, maximumRadius * Math.sqrt(value / maximum));
}

export function comparableFacilityUnit(units: string[]) {
  const measuredUnits = new Set(units.filter(Boolean));
  return measuredUnits.size === 1 ? [...measuredUnits][0] : null;
}
