import type { ResolvedFacility } from "../data/schema";
import { comparableFacilityUnit } from "../lib/facilityMeasures";

export function MapLegend({ facilities }: { facilities: ResolvedFacility[] }) {
  if (!facilities.length) {
    return (
      <div className="map-legend" aria-label="Map legend">
        No mapped U.S. facilities in the current public dataset
      </div>
    );
  }
  const measured = facilities.filter(
    (facility) => facility.measureValue !== null,
  );
  const unit = comparableFacilityUnit(
    measured.map((facility) => facility.measureUnit),
  );
  return (
    <div className="map-legend" aria-label="Map legend">
      <span className="map-legend__dot" aria-hidden="true" />
      <span>
        Active U.S. manufacturing facility
        {unit
          ? ` · circle area shows nameplate ${unit}`
          : " · capacity not comparable"}
      </span>
      {facilities.some((facility) => facility.measureValue === null) ? (
        <span className="map-legend__unknown">
          <i aria-hidden="true" /> Value unavailable
        </span>
      ) : null}
    </div>
  );
}
