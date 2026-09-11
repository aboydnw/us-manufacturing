import type { ResolvedFacility } from "../data/schema";

export function FacilityDetail({ facility }: { facility: ResolvedFacility }) {
  return (
    <article className="panel-detail">
      <p className="panel-detail__eyebrow">U.S. manufacturing facility</p>
      <h2>{facility.name}</h2>
      <p className="panel-detail__place">
        {facility.city}, {facility.state}
      </p>
      <dl className="panel-detail__facts">
        <div>
          <dt>Produces</dt>
          <dd>{facility.facilityType}</dd>
        </div>
        <div>
          <dt>Status in source</dt>
          <dd>{facility.status}</dd>
        </div>
        <div>
          <dt>Reported annual nameplate capacity</dt>
          <dd>
            {facility.measureValue === null
              ? "Not available on a comparable basis"
              : `${facility.measureValue.toLocaleString()} ${facility.measureUnit}`}
          </dd>
        </div>
        <div>
          <dt>Observation date</dt>
          <dd>{facility.measurePeriod}</dd>
        </div>
      </dl>
      <p className="panel-detail__caveat">{facility.limitation}</p>
      <a href={facility.sourceUrl} target="_blank" rel="noreferrer">
        View {facility.source.publisher} source{" "}
        <span aria-hidden="true">↗</span>
        <span className="sr-only"> (opens in a new tab)</span>
      </a>
    </article>
  );
}
