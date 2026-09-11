import { useLayoutEffect, useRef } from "react";
import type { UIEvent } from "react";
import type { ResolvedFacility } from "../data/schema";

interface Props {
  facilities: ResolvedFacility[];
  initialScrollTop: number;
  onScroll: (scrollTop: number) => void;
  onSelect: (id: string) => void;
}

export function FacilityList({
  facilities,
  initialScrollTop,
  onScroll,
  onSelect,
}: Props) {
  const listRef = useRef<HTMLUListElement>(null);
  useLayoutEffect(() => {
    if (listRef.current) listRef.current.scrollTop = initialScrollTop;
  }, [initialScrollTop]);

  function handleScroll(event: UIEvent<HTMLUListElement>) {
    onScroll(event.currentTarget.scrollTop);
  }

  if (!facilities.length) {
    return (
      <div className="facility-list__empty">
        <strong>No mapped U.S. facilities for this stage</strong>
        <p>This may be a true gap or a gap in the public source.</p>
      </div>
    );
  }

  return (
    <ul
      ref={listRef}
      className="facility-list"
      aria-label="U.S. facilities"
      onScroll={handleScroll}
    >
      {facilities.map((facility) => (
        <li key={facility.id}>
          <button type="button" onClick={() => onSelect(facility.id)}>
            <span>
              <strong>{facility.name}</strong>
              <small>
                {facility.city}, {facility.state}
              </small>
            </span>
            <span className="facility-list__measure">
              {facility.measureValue === null
                ? "Value unavailable"
                : `${facility.measureValue.toLocaleString()} ${facility.measureUnit}`}
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}
